import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import AppInput from '../../components/common/AppInput';
import AppText from '../../components/common/AppText';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import groupApi from '../../services/groupApi';
import api from '../../services/api';
import {useNavigation} from '@react-navigation/native';

interface Friend {
  friendId: string;
  firstName: string;
  lastName: string;
  image?: string;
  profilePicture?: string;
}

const GROUP_TYPES = [
  {key: 'general', label: 'General', icon: 'star-outline'},
  {key: 'trip', label: 'Trip', icon: 'airplane'},
  {key: 'home', label: 'Home', icon: 'home-outline'},
  {key: 'couple', label: 'Couple', icon: 'heart-outline'},
  {key: 'other', label: 'Other', icon: 'dots-horizontal'},
];

const CreateGroup = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const {user: authUser} = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('general');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const res = await api.get(`/api/chat/getFriends/${userId}`);

      // API returns a flat array directly in res.data
      let data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Normalize casing - backend uses u."firstName" which should be firstName
      // but let's be safe and check both casings.
      const normalizedData = data.map((item: any) => ({
        friendId: item.friendId || item.id,
        firstName: item.firstName || item.firstname || '',
        lastName: item.lastName || item.lastname || '',
        image: item.image || item.profilePicture,
      }));

      setFriends(normalizedData);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleMember = (friend: Friend) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.friendId === friend.friendId);
      if (exists) {
        return prev.filter(m => m.friendId !== friend.friendId);
      }
      return [...prev, friend];
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    setSubmitting(true);
    try {
      const res = await groupApi.createGroup({
        name: name.trim(),
        members: selectedMembers.map(m => m.friendId),
        description: description.trim() || undefined,
        type: groupType,
      });

      if (res.data?.success) {
        navigation.navigate('GroupDetail', {groupId: res.data.data.id});
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to create group');
      }
    } catch (err: any) {
      console.error('Create group error:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create group',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFriends = searchQuery
    ? friends.filter(f =>
        `${f.firstName} ${f.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : friends;

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header title="Create Group" showBackButton showImage={false} />

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Group Name */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semiBold">
            Group Name *
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="e.g. Weekend Trip, Roommates"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semiBold">
            Description (optional)
          </AppText>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              {
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="What's this group about?"
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Group Type */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semiBold">
            Group Type
          </AppText>
          <View style={styles.typeRow}>
            {GROUP_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor:
                      groupType === type.key
                        ? colors.primary
                        : colors.inputBackground,
                    borderColor:
                      groupType === type.key
                        ? colors.primary
                        : colors.inputBorder,
                  },
                ]}
                onPress={() => setGroupType(type.key)}>
                <Icon
                  name={type.icon}
                  size={14}
                  color={groupType === type.key ? '#FFFFFF' : colors.mutedText}
                />
                <AppText
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color:
                      groupType === type.key ? '#FFFFFF' : colors.mutedText,
                  }}>
                  {type.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <View style={styles.section}>
            <AppText variant="sm" weight="semiBold">
              Members ({selectedMembers.length})
            </AppText>
            <View style={styles.selectedChips}>
              {selectedMembers.map(member => (
                <TouchableOpacity
                  key={member.friendId}
                  style={[
                    styles.memberChip,
                    {backgroundColor: colors.primary + '20'},
                  ]}
                  onPress={() => toggleMember(member)}>
                  <AppText
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: colors.primary,
                    }}>
                    {member.firstName} {member.lastName}
                  </AppText>
                  <Icon name="close" size={14} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Friend Search */}
        <View style={styles.section}>
          <AppText variant="sm" weight="semiBold">
            Add Friends
          </AppText>
          <AppInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for friends"
            leftIcon={
              <Icon name="magnify" size={22} color={colors.mutedText} />
            }
            containerStyle={{marginBottom: 0}}
          />
        </View>

        {/* Friend List */}
        {loadingFriends ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{marginTop: 8}}
          />
        ) : (
          <View style={styles.friendList}>
            {filteredFriends.map(friend => {
              const isSelected = selectedMembers.some(
                m => m.friendId === friend.friendId,
              );
              return (
                <TouchableOpacity
                  key={friend.friendId}
                  style={[
                    styles.friendRow,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '10'
                        : colors.surface,
                    },
                  ]}
                  onPress={() => toggleMember(friend)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.friendAvatar,
                      {backgroundColor: colors.primary + '20'},
                    ]}>
                    <AppText weight="bold" style={{color: colors.primary}}>
                      {(friend.firstName?.[0] || '?').toUpperCase()}
                    </AppText>
                  </View>
                  <AppText style={{flex: 1, color: colors.text}}>
                    {friend.firstName} {friend.lastName}
                  </AppText>
                  <Icon
                    name={
                      isSelected
                        ? 'checkbox-marked-circle'
                        : 'checkbox-blank-circle-outline'
                    }
                    size={22}
                    color={isSelected ? colors.primary : colors.mutedText}
                  />
                </TouchableOpacity>
              );
            })}
            {filteredFriends.length === 0 && !loadingFriends && (
              <AppText
                style={{
                  color: colors.mutedText,
                  textAlign: 'center',
                  paddingVertical: 20,
                }}>
                {searchQuery
                  ? 'No friends match your search'
                  : 'No friends found'}
              </AppText>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Button */}
      <View style={[styles.footer, {borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                name.trim() && selectedMembers.length > 0
                  ? colors.primary
                  : colors.primary + '40',
            },
          ]}
          onPress={handleCreate}
          disabled={submitting || !name.trim() || selectedMembers.length === 0}
          activeOpacity={0.8}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="account-group" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Create Group</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  friendList: {
    gap: 2,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 12,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitial: {
    fontSize: 15,
    fontWeight: '600',
  },
  friendName: {
    fontSize: 15,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroup;
