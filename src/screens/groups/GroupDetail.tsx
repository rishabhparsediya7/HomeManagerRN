import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import AppText from '../../components/common/AppText';
import SegmentedControl from '../../components/common/SegmentedControl';
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
  const [activeTab, setActiveTab] = useState('Expenses');

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
      style={[styles.expenseRow, {borderBottomColor: colors.border}]}
      activeOpacity={0.7}>
      <View style={styles.expenseLeft}>
        <AppText variant="md" weight="medium">
          {item.description}
        </AppText>
        <AppText variant="sm" style={{color: colors.mutedText}}>
          {item.creatorName} • {new Date(item.expenseDate).toLocaleDateString()}
        </AppText>
      </View>
      <AppText variant="lg" weight="semiBold">
        ₹{parseFloat(item.totalAmount).toFixed(2)}
      </AppText>
    </TouchableOpacity>
  );

  const renderMemberItem = ({item}: {item: GroupMember}) => (
    <View style={[styles.memberRow, {borderBottomColor: colors.border}]}>
      <View
        style={[styles.memberAvatar, {backgroundColor: colors.primary + '15'}]}>
        <AppText weight="bold" style={{color: colors.primary, fontSize: 16}}>
          {item.firstName.charAt(0).toUpperCase()}
        </AppText>
      </View>
      <View style={styles.memberInfo}>
        <AppText variant="md" weight="medium">
          {item.firstName} {item.lastName}
          {item.id === group?.createdByUser ? ' (Admin)' : ''}
        </AppText>
        <AppText variant="sm" style={{color: colors.mutedText}}>
          {item.email}
        </AppText>
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
          <AppText variant="md" style={{color: colors.mutedText}}>
            Group not found
          </AppText>
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerBtn, {backgroundColor: colors.info + '15'}]}
              onPress={() =>
                navigation.navigate('GroupChat', {
                  groupId: group.id,
                  groupName: group.name,
                })
              }>
              <Icon name="chat-outline" size={20} color={colors.info} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerBtn,
                {backgroundColor: colors.primary + '15'},
              ]}
              onPress={() =>
                navigation.navigate('GroupSettings', {groupId: group.id})
              }>
              <Icon name="cog-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Subtitle row */}
      <View style={styles.subtitleRow}>
        <View style={styles.subtitleItem}>
          <Icon name="account-multiple" size={16} color={colors.mutedText} />
          <AppText variant="sm" style={{color: colors.mutedText}}>
            {group.members?.length || 0} members
          </AppText>
        </View>
        {group.type !== 'general' && (
          <View style={styles.subtitleItem}>
            <Icon name="tag-outline" size={16} color={colors.mutedText} />
            <AppText
              variant="sm"
              weight="medium"
              style={{color: colors.primary, textTransform: 'capitalize'}}>
              {group.type}
            </AppText>
          </View>
        )}
      </View>

      {/* Segmented Tab Control */}
      <SegmentedControl
        options={['Expenses', 'Members']}
        activeOption={activeTab}
        onOptionPress={setActiveTab}
        containerStyle={{marginHorizontal: 16, marginTop: 12}}
      />

      {/* Tab Content */}
      {activeTab === 'Expenses' && (
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
              <Icon name="receipt" size={44} color={colors.mutedText} />
              <AppText variant="md" style={{color: colors.mutedText}}>
                No expenses yet
              </AppText>
            </View>
          }
        />
      )}

      {activeTab === 'Members' && (
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  subtitleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
  },
  expenseLeft: {
    flex: 1,
    gap: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    gap: 3,
  },
  emptyTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
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
