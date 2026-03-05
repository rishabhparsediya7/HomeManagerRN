import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/common/AppText';
import Header from '../../components/Header';
import {lightTheme} from '../../providers/Theme';
import {useHomeStore} from '../../store';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {useAuthorizeNavigation} from '../../navigators/navigators';

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = lightTheme;
  const navigation = useAuthorizeNavigation();
  const {decrementUnreadNotifications, clearUnreadNotifications} =
    useHomeStore();

  const fetchNotifications = useCallback(async () => {
    try {
      // The backend expects userId in the params, but our api client usually
      // appends it from segments or we need to provide it.
      // Based on router: /api/notifications/:userId
      const response = await api.get('/api/notifications/me'); // Assuming 'me' works or we get it from auth
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? {...n, isRead: true} : n)),
      );
      decrementUnreadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNotificationPress = (item: Notification) => {
    markAsRead(item.id);

    // Deep linking based on type
    if (item.type === 'split_expense' && item.data?.splitExpenseId) {
      navigation.navigate('SplitExpenseDetail', {
        splitExpenseId: item.data.splitExpenseId,
      });
    } else if (item.type === 'settlement' && item.data?.splitExpenseId) {
      navigation.navigate('SplitExpenseDetail', {
        splitExpenseId: item.data.splitExpenseId,
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/me/read-all');
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      clearUnreadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const renderItem = ({item}: {item: Notification}) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && {backgroundColor: colors.primary + '08'},
      ]}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.typeIcon,
            {
              backgroundColor: !item.isRead
                ? colors.primary
                : colors.mutedText + '20',
            },
          ]}>
          <Icon
            name={item.isRead ? 'notifications-none' : 'notifications-active'}
            size={20}
            color={!item.isRead ? 'white' : colors.mutedText}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <AppText variant="lg" weight="bold" style={styles.title}>
            {item.title}
          </AppText>
          <AppText variant="caption" color={colors.mutedText}>
            {dayjs(item.createdAt).fromNow()}
          </AppText>
        </View>
        <AppText variant="md" color={colors.mutedText} style={styles.body}>
          {item.body}
        </AppText>
      </View>
      {!item.isRead && <View style={styles.readDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          notifications.some(n => !n.isRead) ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <AppText variant="md" color={colors.primary} weight="semiBold">
                Mark all as read
              </AppText>
            </TouchableOpacity>
          ) : null
        }
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Icon
                name="notifications-off"
                size={64}
                color={colors.mutedText + '40'}
              />
              <AppText
                variant="h6"
                color={colors.mutedText}
                style={{marginTop: 16}}>
                No notifications yet
              </AppText>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  body: {
    lineHeight: 18,
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightTheme.primary,
    marginLeft: 12,
  },
});

export default NotificationsScreen;
