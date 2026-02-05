import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Header from '../../components/Header';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import splitExpenseApi from '../../services/splitExpenseApi';
import {useAuth} from '../../providers/AuthProvider';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RupeeIcon from '../../components/rupeeIcon';
import {category} from '../../constants';

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface SelectedFriend extends Friend {
  amountOwed: number;
}

const CreateSplitExpense = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {theme} = useTheme();
  const {user} = useAuth();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [splitEqually, setSplitEqually] = useState(true);
  const [paidByMe, setPaidByMe] = useState(true);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  // Fetch friends list
  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const response = await api.get(`/api/chat/getFriends/${userId}`);
      setFriends(response.data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Update amounts when total or split type changes
  useEffect(() => {
    if (splitEqually && selectedFriends.length > 0 && totalAmount) {
      const amount = parseFloat(totalAmount);
      const perPerson = amount / (selectedFriends.length + 1); // +1 for current user
      setSelectedFriends(
        selectedFriends.map(f => ({
          ...f,
          amountOwed: Math.round(perPerson * 100) / 100,
        })),
      );
    }
  }, [totalAmount, splitEqually]);

  const handleDateConfirm = (date: Date) => {
    setExpenseDate(date);
    setDatePickerVisibility(false);
  };

  const toggleFriend = (friend: Friend) => {
    const exists = selectedFriends.find(f => f.id === friend.id);
    if (exists) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      const amount =
        splitEqually && totalAmount
          ? parseFloat(totalAmount) / (selectedFriends.length + 2)
          : 0;
      setSelectedFriends([
        ...selectedFriends,
        {...friend, amountOwed: Math.round(amount * 100) / 100},
      ]);
    }
  };

  const updateFriendAmount = (friendId: string, amount: string) => {
    setSelectedFriends(
      selectedFriends.map(f =>
        f.id === friendId ? {...f, amountOwed: parseFloat(amount) || 0} : f,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend to split with');
      return;
    }

    setSubmitting(true);
    try {
      const paidBy = paidByMe ? user.userId : selectedFriends[0].id;

      // Build participants array
      const participants = [
        // Add all selected friends
        ...selectedFriends.map(f => ({
          userId: f.id,
          amountOwed: f.amountOwed,
        })),
        // Add current user if not the payer
        ...(paidByMe
          ? []
          : [
              {
                userId: user.userId,
                amountOwed:
                  parseFloat(totalAmount) -
                  selectedFriends.reduce((sum, f) => sum + f.amountOwed, 0),
              },
            ]),
      ];

      // If I paid, I should also be a participant (as the payer)
      if (paidByMe) {
        participants.push({
          userId: user.userId,
          amountOwed: 0, // I don't owe myself
        });
      }

      const response = await splitExpenseApi.create({
        description,
        totalAmount: parseFloat(totalAmount),
        category: selectedCategory || undefined,
        participants,
        expenseDate: expenseDate.toISOString(),
        paidBy,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Split expense created!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', 'Failed to create split expense');
      }
    } catch (error) {
      console.error('Error creating split expense:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 8,
      ...commonStyles.textDefault,
    },
    input: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      ...commonStyles.textDefault,
    },
    amountInput: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      gap: 8,
    },
    dateText: {
      color: colors.text,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
    categoryScroll: {
      marginBottom: 8,
    },
    categoryItem: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginRight: 12,
      minWidth: 80,
    },
    categoryItemSelected: {
      backgroundColor: colors.primary,
    },
    categoryItemUnselected: {
      backgroundColor: colors.cardBackground,
    },
    categoryText: {
      fontSize: 11,
      marginTop: 4,
      textAlign: 'center',
      ...commonStyles.textDefault,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    toggleActive: {
      backgroundColor: colors.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '500',
      ...commonStyles.textDefault,
    },
    friendsContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      overflow: 'hidden',
    },
    addFriendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    addFriendText: {
      color: colors.primary,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
    selectedFriend: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    friendInfo: {
      flex: 1,
      marginLeft: 12,
    },
    friendName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      ...commonStyles.textDefault,
    },
    friendAmountInput: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      width: 80,
      textAlign: 'center',
      color: colors.text,
      fontSize: 14,
    },
    removeButton: {
      padding: 8,
    },
    friendSelector: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginTop: 8,
      maxHeight: 200,
    },
    friendOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    friendOptionSelected: {
      backgroundColor: colors.primary + '20',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      ...commonStyles.textDefault,
    },
    previewSection: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    previewTitle: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 12,
      ...commonStyles.textDefault,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    previewName: {
      color: colors.text,
      ...commonStyles.textDefault,
    },
    previewAmount: {
      color: colors.primary,
      fontWeight: '600',
      ...commonStyles.textDefault,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Create Split Expense" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Total Amount</Text>
            <View
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Text style={{color: colors.text, fontSize: 28, marginRight: 4}}>
                ₹
              </Text>
              <TextInput
                style={[styles.amountInput, {color: colors.text, flex: 1}]}
                placeholder="0"
                placeholderTextColor={colors.mutedText}
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={setTotalAmount}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What's this expense for?"
              placeholderTextColor={colors.mutedText}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisibility(true)}>
              <Icon name="calendar" size={20} color={colors.mutedText} />
              <Text style={styles.dateText}>
                {expenseDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}>
              {category.map(cat => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === parseInt(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      isSelected
                        ? styles.categoryItemSelected
                        : styles.categoryItemUnselected,
                    ]}
                    onPress={() => setSelectedCategory(parseInt(cat.id))}>
                    <IconComponent />
                    <Text
                      style={[
                        styles.categoryText,
                        {color: isSelected ? '#fff' : colors.text},
                      ]}>
                      {cat.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Paid By Toggle */}
          <View style={styles.section}>
            <Text style={styles.label}>Paid by</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, paidByMe && styles.toggleActive]}
                onPress={() => setPaidByMe(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    {color: paidByMe ? '#fff' : colors.text},
                  ]}>
                  You
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !paidByMe && styles.toggleActive]}
                onPress={() => setPaidByMe(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    {color: !paidByMe ? '#fff' : colors.text},
                  ]}>
                  Someone else
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Split Type Toggle */}
          <View style={styles.section}>
            <Text style={styles.label}>Split type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  splitEqually && styles.toggleActive,
                ]}
                onPress={() => setSplitEqually(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    {color: splitEqually ? '#fff' : colors.text},
                  ]}>
                  Equal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !splitEqually && styles.toggleActive,
                ]}
                onPress={() => setSplitEqually(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    {color: !splitEqually ? '#fff' : colors.text},
                  ]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Friends Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Split with</Text>
            <View style={styles.friendsContainer}>
              {/* Selected friends */}
              {selectedFriends.map(friend => (
                <View key={friend.id} style={styles.selectedFriend}>
                  <Icon
                    name="account-circle"
                    size={40}
                    color={colors.mutedText}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>
                      {friend.firstName} {friend.lastName}
                    </Text>
                  </View>
                  {!splitEqually && (
                    <TextInput
                      style={styles.friendAmountInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={friend.amountOwed.toString()}
                      onChangeText={val => updateFriendAmount(friend.id, val)}
                    />
                  )}
                  {splitEqually && (
                    <RupeeIcon
                      amount={friend.amountOwed}
                      size={14}
                      color={colors.primary}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => toggleFriend(friend)}>
                    <Icon name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add friend button */}
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={() => setShowFriendSelector(!showFriendSelector)}>
                <Icon name="plus-circle" size={24} color={colors.primary} />
                <Text style={styles.addFriendText}>Add friends</Text>
              </TouchableOpacity>
            </View>

            {/* Friend selector dropdown */}
            {showFriendSelector && (
              <ScrollView style={styles.friendSelector} nestedScrollEnabled>
                {loadingFriends ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{padding: 20}}
                  />
                ) : friends.length === 0 ? (
                  <Text
                    style={{
                      padding: 16,
                      color: colors.mutedText,
                      textAlign: 'center',
                    }}>
                    No friends found. Add friends in Chat first.
                  </Text>
                ) : (
                  friends.map(friend => {
                    const isSelected = selectedFriends.some(
                      f => f.id === friend.id,
                    );
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        style={[
                          styles.friendOption,
                          isSelected && styles.friendOptionSelected,
                        ]}
                        onPress={() => toggleFriend(friend)}>
                        <Icon
                          name="account-circle"
                          size={36}
                          color={colors.mutedText}
                        />
                        <Text style={[styles.friendName, {marginLeft: 12}]}>
                          {friend.firstName} {friend.lastName}
                        </Text>
                        {isSelected && (
                          <Icon
                            name="check-circle"
                            size={24}
                            color={colors.primary}
                            style={{marginLeft: 'auto'}}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>

          {/* Preview */}
          {selectedFriends.length > 0 && totalAmount && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Split Preview</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewName}>
                  You {paidByMe ? '(paid)' : ''}
                </Text>
                <Text style={styles.previewAmount}>
                  ₹
                  {splitEqually
                    ? (
                        parseFloat(totalAmount) /
                        (selectedFriends.length + 1)
                      ).toFixed(2)
                    : (
                        parseFloat(totalAmount) -
                        selectedFriends.reduce((s, f) => s + f.amountOwed, 0)
                      ).toFixed(2)}
                </Text>
              </View>
              {selectedFriends.map(friend => (
                <View key={friend.id} style={styles.previewRow}>
                  <Text style={styles.previewName}>{friend.firstName}</Text>
                  <Text style={styles.previewAmount}>
                    ₹{friend.amountOwed.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && {opacity: 0.6}]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Split</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        date={expenseDate}
      />
    </View>
  );
};

export default CreateSplitExpense;
