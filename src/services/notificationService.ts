import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform, PermissionsAndroid} from 'react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Create the default notification channel (Android 8+)
 */
async function createDefaultChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

/**
 * Display a notification using Notifee (works in foreground AND background)
 */
export async function displayNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  await createDefaultChannel();
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      smallIcon: 'ic_launcher',
      pressAction: {id: 'default'},
      sound: 'default',
    },
  });
}

/**
 * Request notification permissions (required for iOS + Android 13+)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Request FCM permission (handles iOS)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  // Request POST_NOTIFICATIONS permission for Android 13+ (API 33+)
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('🔕 POST_NOTIFICATIONS permission denied');
      return false;
    }
  }

  if (enabled) {
    console.log('🔔 Notification permission granted');
  } else {
    console.log('🔕 Notification permission denied');
  }
  return enabled;
}

/**
 * Get FCM token and register it with the backend
 */
export async function registerForNotifications(userId: string): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Create notification channel early
    await createDefaultChannel();

    // Get the FCM token
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);

    // Store token locally
    await AsyncStorage.setItem('fcmToken', token);

    // Register with backend
    await api.post('/api/notifications/register-token', {
      userId,
      token,
      platform: Platform.OS,
    });
    console.log('✅ FCM token registered with backend');

    // Listen for token refresh
    messaging().onTokenRefresh(async newToken => {
      console.log('🔄 FCM Token refreshed:', newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      await api.post('/api/notifications/register-token', {
        userId,
        token: newToken,
        platform: Platform.OS,
      });
    });
  } catch (error) {
    console.error('❌ Error registering for notifications:', error);
  }
}

/**
 * Unregister FCM token from backend (call on sign-out)
 */
export async function unregisterNotifications(userId: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('fcmToken');
    if (token) {
      await api.post('/api/notifications/unregister-token', {
        userId,
        token,
      });
      await AsyncStorage.removeItem('fcmToken');
      console.log('📱 FCM token unregistered');
    }
  } catch (error) {
    console.error('❌ Error unregistering notifications:', error);
  }
}

/**
 * Set up foreground notification handler
 * Shows a system notification when a message arrives while the app is open
 */
export function setupForegroundHandler() {
  return messaging().onMessage(async remoteMessage => {
    console.log('📬 Foreground notification:', remoteMessage);
    const {notification, data} = remoteMessage;
    if (notification) {
      await displayNotification(
        notification.title || 'New Notification',
        notification.body || '',
        data as Record<string, string>,
      );
    }
  });
}
