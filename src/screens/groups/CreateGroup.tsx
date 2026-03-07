import React, {useState} from 'react';
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
import AppText from '../../components/common/AppText';
import FriendSelector, {
  FriendItem,
} from '../../components/friendSelector/FriendSelector';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import groupApi from '../../services/groupApi';
import {useNavigation} from '@react-navigation/native';

// Using FriendItem from FriendSelector (normalized with `id` field)

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
  const [selectedMembers, setSelectedMembers] = useState<FriendItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleMember = (friend: FriendItem) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === friend.id);
      if (exists) {
        return prev.filter(m => m.id !== friend.id);
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
        members: selectedMembers.map(m => m.id),
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

        {/* Friend Selector */}
        <View style={styles.section}>
          <FriendSelector
            label="Add Friends"
            selectedFriends={selectedMembers}
            onToggleFriend={toggleMember}
            showGlobalSearch={false}
            placeholder="Search friends to add..."
          />
        </View>
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
