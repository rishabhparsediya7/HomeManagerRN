import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
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
  GroupMember,
} from '../../services/groupApi';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import GroupChat from './GroupChat';
import {createInitialsForImage} from '../../utils/users';

const GroupDetail = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {user: authUser} = useAuth();
  const groupId = route.params?.groupId;

  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Chat');

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
    }, [groupId]),
  );

  const renderMemberItem = ({item}: {item: GroupMember}) => (
    <View style={[styles.memberRow, {borderBottomColor: colors.border}]}>
      <View
        style={[styles.memberAvatar, {backgroundColor: colors.primary + '15'}]}>
        <AppText weight="bold" variant="lg">
          {createInitialsForImage(item.firstName + ' ' + item.lastName)}
        </AppText>
      </View>
      <View style={styles.memberInfo}>
        <AppText variant="lg" weight="medium">
          {item.firstName} {item.lastName}
          {item.id === group?.createdByUser ? ' (Admin)' : ''}
        </AppText>
        <AppText variant="md" style={{color: colors.mutedText}}>
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
      {/* {group.type && group.type !== 'general' && (
        <View style={styles.subtitleRow}>
          <View style={styles.subtitleItem}>
            <Icon name="tag-outline" size={16} color={colors.mutedText} />
            <AppText
              variant="md"
              weight="medium"
              style={{color: colors.primary, textTransform: 'capitalize'}}>
              {group.type}
            </AppText>
          </View>
        </View>
      )} */}

      {/* Segmented Tab Control */}
      <SegmentedControl
        options={['Chat', 'Members']}
        activeOption={activeTab}
        onOptionPress={setActiveTab}
        containerStyle={{marginHorizontal: 16, marginTop: 12}}
      />

      {/* Tab Content */}
      <View style={{flex: 1, marginTop: 8}}>
        {activeTab === 'Chat' && (
          <GroupChat
            groupId={groupId}
            groupName={group.name}
            isEmbedded={true}
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
      </View>

      {/* FAB — Add Expense */}
      {activeTab === 'Chat' && (
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
      )}
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
  fab: {
    position: 'absolute',
    bottom: 80, // Moved up to not overlap with chat input
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 10,
  },
});

export default GroupDetail;
