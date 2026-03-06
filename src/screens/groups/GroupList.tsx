import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import groupApi, {Group} from '../../services/groupApi';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const GroupList = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await groupApi.getGroupList();
      if (res.data?.success) {
        setGroups(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const renderGroupItem = ({item}: {item: Group}) => {
    const net = item.balanceSummary?.net || 0;
    const isPositive = net > 0;
    const isNegative = net < 0;

    return (
      <TouchableOpacity
        style={[styles.groupCard, {backgroundColor: colors.cardBackground}]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('GroupDetail', {groupId: item.id})}>
        <View style={styles.groupCardLeft}>
          <View
            style={[
              styles.groupAvatar,
              {backgroundColor: colors.primary + '20'},
            ]}>
            {item.image ? (
              <Text style={styles.groupAvatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Icon name="account-group" size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, {color: colors.text}]}>
              {item.name}
            </Text>
            <Text style={[styles.groupMeta, {color: colors.mutedText}]}>
              {item.memberCount || 0} members
              {item.type !== 'general' ? ` • ${item.type}` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.groupCardRight}>
          {net !== 0 && (
            <Text
              style={[
                styles.balanceText,
                {color: isPositive ? colors.success : colors.error},
              ]}>
              {isPositive ? '+' : ''}₹{Math.abs(net).toFixed(2)}
            </Text>
          )}
          {net === 0 && (
            <Text style={[styles.settledText, {color: colors.mutedText}]}>
              settled
            </Text>
          )}
          <Icon name="chevron-right" size={20} color={colors.mutedText} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[styles.emptyIcon, {backgroundColor: colors.primary + '15'}]}>
        <Icon name="account-group-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>
        No groups yet
      </Text>
      <Text style={[styles.emptySubtitle, {color: colors.mutedText}]}>
        Create a group to split expenses with multiple friends
      </Text>
      <TouchableOpacity
        style={[styles.createBtn, {backgroundColor: colors.primary}]}
        onPress={() => navigation.navigate('CreateGroup')}>
        <Icon name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.createBtnText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.screen, {backgroundColor: colors.background}]}>
        <Header title="Groups" showBackButton />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header
        title="Groups"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
            <Icon name="plus" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  groupCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  groupInfo: {
    gap: 2,
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupMeta: {
    fontSize: 12,
  },
  groupCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settledText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GroupList;
