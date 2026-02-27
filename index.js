/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// Handle background/quit notifications — explicitly display with Notifee
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification:', remoteMessage);
  const {notification, data} = remoteMessage;
  if (notification) {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    await notifee.displayNotification({
      title: notification.title || 'New Notification',
      body: notification.body || '',
      data: data,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
        sound: 'default',
      },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
