import React, {useState, useCallback} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import FriendSelector, {
  FriendItem,
} from '../../components/friendSelector/FriendSelector';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import groupApi, {GroupMember} from '../../services/groupApi';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';

const GroupSettings = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {user: authUser} = useAuth();
  const groupId = route.params?.groupId;

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [createdBy, setCreatedBy] = useState('');

  const fetchGroupData = async () => {
    try {
      const res = await groupApi.getGroupDetails(groupId);
      if (res.data?.success) {
        const group = res.data.data;
        setGroupName(group.name);
        setGroupDesc(group.description || '');
        setMembers(group.members || []);
        setCreatedBy(group.createdByUser);
      }
    } catch (err) {
      console.error('Failed to load group settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroupData();
    }, [groupId]),
  );

  const handleAddMember = async (friend: FriendItem) => {
    try {
      const res = await groupApi.addMembers(groupId, [friend.id]);
      if (res.data?.success) {
        fetchGroupData();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupApi.removeMembers(groupId, [memberId]);
              fetchGroupData();
            } catch {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ],
    );
  };

  const handleUpdateGroup = async () => {
    try {
      await groupApi.updateGroup({
        groupId,
        name: groupName.trim(),
        description: groupDesc.trim() || undefined,
      });
      Alert.alert('Success', 'Group updated');
    } catch {
      Alert.alert('Error', 'Failed to update group');
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group and all its data.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupApi.deleteGroup(groupId);
              navigation.navigate('GroupList');
            } catch {
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ],
    );
  };

  const isAdmin = authUser?.userId === createdBy;

  if (loading) {
    return (
      <View style={[styles.screen, {backgroundColor: colors.background}]}>
        <Header title="Group Settings" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header title="Group Settings" showBackButton />

      <FlatList
        data={[1]}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Edit Group Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Group Info
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group name"
                placeholderTextColor={colors.placeholder}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.multiline,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={groupDesc}
                onChangeText={setGroupDesc}
                placeholder="Description (optional)"
                placeholderTextColor={colors.placeholder}
                multiline
              />
              <TouchableOpacity
                style={[styles.saveBtn, {backgroundColor: colors.primary}]}
                onPress={handleUpdateGroup}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>

            {/* Members */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Members ({members.length})
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddMember(!showAddMember);
                  }}>
                  <Icon
                    name={showAddMember ? 'close' : 'account-plus'}
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {showAddMember && (
                <View style={styles.addMemberSection}>
                  <FriendSelector
                    selectedFriends={members.map(m => ({
                      id: m.id,
                      firstName: m.firstName,
                      lastName: m.lastName,
                    }))}
                    onToggleFriend={handleAddMember}
                    showGlobalSearch={false}
                    placeholder="Search friends to add..."
                    showSelectedChips={false}
                  />
                </View>
              )}

              {members.map(member => (
                <View
                  key={member.id}
                  style={[
                    styles.memberRow,
                    {backgroundColor: colors.cardBackground},
                  ]}>
                  <View
                    style={[
                      styles.avatar,
                      {backgroundColor: colors.primary + '20'},
                    ]}>
                    <Text style={{color: colors.primary, fontWeight: '600'}}>
                      {member.firstName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.memberName, {color: colors.text}]}>
                      {member.firstName} {member.lastName}
                      {member.id === createdBy ? ' (Admin)' : ''}
                    </Text>
                  </View>
                  {isAdmin && member.id !== authUser?.userId && (
                    <TouchableOpacity
                      onPress={() =>
                        handleRemoveMember(
                          member.id,
                          `${member.firstName} ${member.lastName}`,
                        )
                      }>
                      <Icon
                        name="account-remove"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Danger Zone */}
            {isAdmin && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.error}]}>
                  Danger Zone
                </Text>
                <TouchableOpacity
                  style={[styles.dangerBtn, {borderColor: colors.error}]}
                  onPress={handleDeleteGroup}>
                  <Icon name="delete-outline" size={18} color={colors.error} />
                  <Text style={[styles.dangerBtnText, {color: colors.error}]}>
                    Delete Group
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        keyExtractor={() => 'settings'}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addMemberSection: {
    gap: 6,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  friendName: {
    flex: 1,
    fontSize: 15,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default GroupSettings;
