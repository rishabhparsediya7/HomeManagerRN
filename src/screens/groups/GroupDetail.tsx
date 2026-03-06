import React, {useCallback, useState} from 'react';
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
import {useAuth} from '../../providers/AuthProvider';
import groupApi, {
  GroupDetail as GroupDetailType,
  GroupExpense,
  GroupMember,
} from '../../services/groupApi';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';

type TabKey = 'expenses' | 'members';

const GroupDetail = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {user: authUser} = useAuth();
  const groupId = route.params?.groupId;

  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('expenses');

  const fetchGroup = async () => {
    try {
      const res = await groupApi.getGroupDetails(groupId);
      if (res.data?.success) {
        setGroup(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch group:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
    }, [groupId]),
  );

  const renderExpenseItem = ({item}: {item: GroupExpense}) => (
    <TouchableOpacity
      style={[styles.expenseCard, {backgroundColor: colors.cardBackground}]}
      activeOpacity={0.7}>
      <View style={styles.expenseLeft}>
        <Text style={[styles.expenseDesc, {color: colors.text}]}>
          {item.description}
        </Text>
        <Text style={[styles.expenseMeta, {color: colors.mutedText}]}>
          {item.creatorName} • {new Date(item.expenseDate).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.expenseAmount, {color: colors.text}]}>
        ₹{parseFloat(item.totalAmount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const renderMemberItem = ({item}: {item: GroupMember}) => (
    <View style={[styles.memberRow, {backgroundColor: colors.cardBackground}]}>
      <View
        style={[styles.memberAvatar, {backgroundColor: colors.primary + '20'}]}>
        <Text style={[styles.memberInitial, {color: colors.primary}]}>
          {item.firstName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, {color: colors.text}]}>
          {item.firstName} {item.lastName}
          {item.id === group?.createdByUser ? ' (Admin)' : ''}
        </Text>
        <Text style={[styles.memberEmail, {color: colors.mutedText}]}>
          {item.email}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.screen, {backgroundColor: colors.background}]}>
        <Header title="Group" showBackButton />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.screen, {backgroundColor: colors.background}]}>
        <Header title="Group" showBackButton />
        <View style={styles.loaderContainer}>
          <Text style={{color: colors.mutedText}}>Group not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header
        title={group.name}
        showBackButton
        rightComponent={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GroupSettings', {groupId: group.id})
            }>
            <Icon name="cog-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Group Info Bar */}
      <View style={[styles.infoBar, {backgroundColor: colors.cardBackground}]}>
        <View style={styles.infoItem}>
          <Icon name="account-group" size={18} color={colors.primary} />
          <Text style={[styles.infoText, {color: colors.text}]}>
            {group.members?.length || 0} members
          </Text>
        </View>
        {group.type !== 'general' && (
          <View style={styles.infoItem}>
            <Icon name="tag-outline" size={18} color={colors.secondary} />
            <Text style={[styles.infoText, {color: colors.text}]}>
              {group.type}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() =>
            navigation.navigate('GroupChat', {
              groupId: group.id,
              groupName: group.name,
            })
          }>
          <Icon name="chat-outline" size={18} color={colors.info} />
          <Text style={[styles.infoText, {color: colors.info}]}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, {borderBottomColor: colors.border}]}>
        {(['expenses', 'members'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabItem,
              activeTab === tab && {borderBottomColor: colors.primary},
            ]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab ? colors.primary : colors.mutedText,
                },
              ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <FlatList
          data={group.recentExpenses || []}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchGroup();
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyTab}>
              <Icon name="receipt" size={40} color={colors.mutedText} />
              <Text style={[styles.emptyTabText, {color: colors.mutedText}]}>
                No expenses yet
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'members' && (
        <FlatList
          data={group.members || []}
          renderItem={renderMemberItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — Add Expense */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primary}]}
        onPress={() =>
          navigation.navigate('GroupAddExpense', {
            groupId: group.id,
            members: group.members,
          })
        }
        activeOpacity={0.8}>
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 8,
    flexGrow: 1,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
  },
  expenseLeft: {
    flex: 1,
    gap: 4,
  },
  expenseDesc: {
    fontSize: 15,
    fontWeight: '500',
  },
  expenseMeta: {
    fontSize: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
  },
  emptyTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTabText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

export default GroupDetail;
