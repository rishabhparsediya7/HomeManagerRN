import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/Button';
import CategorySelector from '../../components/categorySelector';
import AppInput from '../../components/common/AppInput';
import AppText from '../../components/common/AppText';
import Header from '../../components/Header';
import RupeeIcon from '../../components/rupeeIcon';
import {category as expenseCategories} from '../../constants';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import api from '../../services/api';
import splitExpenseApi from '../../services/splitExpenseApi';
import {formatDate} from '../../utils/formatDate';
import socket from '../../utils/socket';
import {commonStyles} from '../../utils/styles';

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

interface SelectedFriend extends Friend {
  amountOwed: number;
}

const CreateSplitExpense = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {theme} = useTheme();
  const {user: authUser} = useAuth();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [splitEqually, setSplitEqually] = useState(true);
  const [paidByMe, setPaidByMe] = useState(true);
  const [inputWidth, setInputWidth] = useState(30);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [filteredLocalFriends, setFilteredLocalFriends] = useState<Friend[]>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [requestingSplink, setRequestingSplink] = useState<string | null>(null);

  const categories = useMemo(() => expenseCategories, []);

  const handleAmountChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    const parts = numericText.split('.');
    let sanitized = parts[0];
    if (parts.length > 1) {
      sanitized += '.' + parts[1].slice(0, 2);
    }
    const baseWidth = 30;
    const maxWidth = 100;
    const calculatedWidth = baseWidth + sanitized.length * 3;
    setInputWidth(Math.min(calculatedWidth, maxWidth));
    setTotalAmount(sanitized);
  };

  // Fetch friends list
  const fetchFriendsList = async () => {
    setLoadingFriends(true);
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) return;
      const response = await api.get(`/api/chat/getFriends/${storedUserId}`);
      const mappedFriends = (response.data || []).map((f: any) => ({
        ...f,
        id: f.friendId,
      }));
      setFriends(mappedFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchFriendsList();
  }, []);

  // Handle search query changes — filter local friends and optionally search remote
  useEffect(() => {
    const term = searchQuery.toLowerCase().trim();

    // Always filter local friends based on the search term
    if (term.length === 0) {
      setFilteredLocalFriends(friends);
    } else {
      const filtered = friends.filter(
        f =>
          (f.firstName + ' ' + f.lastName).toLowerCase().includes(term) ||
          f.email?.toLowerCase().includes(term),
      );
      setFilteredLocalFriends(filtered);
    }

    // Remote search when query is long enough
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        searchRemoteUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, friends]);

  useEffect(() => {
    const handleSplinkResponseReceived = (payload: any) => {
      if (payload.action === 'accept') {
        fetchFriendsList();
      }
    };
    socket.on('splink_response', handleSplinkResponseReceived);
    return () => {
      socket.off('splink_response', handleSplinkResponseReceived);
    };
  }, []);

  const searchRemoteUsers = async () => {
    setSearching(true);
    try {
      const resp = await api.get(`/api/users/search?q=${searchQuery}`);
      const results = (resp.data?.users || []).filter(
        (u: Friend) => !friends.some(f => f.id === u.id),
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const initiateSplinkRequest = async (friend: Friend) => {
    setRequestingSplink(friend.id);
    try {
      await api.post('/api/chat/splink/request', {friendId: friend.id});
      Alert.alert(
        'Splink Sent!',
        `A connection request has been sent to ${friend.firstName}. You can add them once they accept.`,
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send Splink request',
      );
    } finally {
      setRequestingSplink(null);
    }
  };

  useEffect(() => {
    if (splitEqually && selectedFriends.length > 0 && totalAmount) {
      const amountValue = parseFloat(totalAmount);
      const perPerson = amountValue / (selectedFriends.length + 1);
      setSelectedFriends(
        selectedFriends.map(f => ({
          ...f,
          amountOwed: Math.round(perPerson * 100) / 100,
        })),
      );
    }
  }, [totalAmount, splitEqually, selectedFriends.length]);

  const onDateConfirm = (date: Date) => {
    setExpenseDate(date);
    setDatePickerVisibility(false);
  };

  const handleToggleFriend = (friend: Friend) => {
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
      setSearchQuery('');
    }
  };

  const updateIndividualAmount = (friendId: string, amount: string) => {
    setSelectedFriends(
      selectedFriends.map(f =>
        f.id === friendId ? {...f, amountOwed: parseFloat(amount) || 0} : f,
      ),
    );
  };

  const handleCreateSplitExpense = async () => {
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
      const payerId = paidByMe ? authUser.userId : selectedFriends[0].id;
      const participants = [
        ...selectedFriends.map(f => ({
          userId: f.id,
          amountOwed: f.amountOwed,
        })),
        ...(paidByMe
          ? []
          : [
              {
                userId: authUser.userId,
                amountOwed:
                  parseFloat(totalAmount) -
                  selectedFriends.reduce((sum, f) => sum + f.amountOwed, 0),
              },
            ]),
      ];

      if (paidByMe) {
        participants.push({
          userId: authUser.userId,
          amountOwed:
            parseFloat(totalAmount) -
            selectedFriends.reduce((sum, f) => sum + f.amountOwed, 0),
        });
      }

      const response = await splitExpenseApi.create({
        description,
        totalAmount: parseFloat(totalAmount),
        category: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        participants,
        expenseDate: expenseDate.toISOString(),
        paidBy: payerId,
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 40,
        },
        sectionTitle: {
          marginBottom: 12,
          marginTop: 24,
        },
        amountRow: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          marginBottom: 8,
          width: '100%',
        },
        amountInput: {
          padding: 16,
          borderRadius: 12,
          color: colors.inputText,
          fontSize: 32,
          fontWeight: '600',
        },
        rupee: {
          fontSize: 32,
          ...commonStyles.textDefault,
          color: colors.buttonText,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        dateBox: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
          padding: 16,
          borderRadius: 12,
        },
        dateText: {
          marginLeft: 8,
          fontSize: 14,
          color: colors.buttonText,
        },
        toggleContainer: {
          flexDirection: 'row',
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          padding: 4,
        },
        toggleButton: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: 'center',
        },
        friendsContainer: {
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          overflow: 'hidden',
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
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 10,
        },
        searchInputField: {
          flex: 1,
          height: 40,
          color: colors.text,
          ...commonStyles.textDefault,
        },
        friendSelector: {
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          marginTop: 8,
          maxHeight: 340,
          overflow: 'hidden',
        },
        sectionLabel: {
          fontSize: 12,
          color: colors.mutedText,
          padding: 12,
          backgroundColor: colors.background,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        friendOption: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        friendOptionSelected: {
          backgroundColor: colors.primary + '10',
        },
        submitButton: {
          marginTop: 32,
        },
        splinkButton: {
          backgroundColor: colors.primary + '20',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          marginLeft: 'auto',
        },
      }),
    [colors, theme],
  );

  return (
    <View style={styles.container}>
      <Header
        title="Create Split"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Total Amount
          </AppText>
          <View style={styles.amountRow}>
            <View style={styles.amountRow}>
              <Text style={styles.rupee}>
                <Icon name="rupee" size={32} color={colors.buttonText} />
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.inputText + '80'}
                value={totalAmount}
                keyboardType="numeric"
                onChangeText={handleAmountChange}
                style={[styles.amountInput, {width: `${inputWidth}%`}]}
              />
            </View>
          </View>

          <AppInput
            containerStyle={{marginTop: 24}}
            label="Expense Title"
            placeholder="What did you spend on?"
            value={description}
            onChangeText={setDescription}
            labelProps={{
              variant: 'h6',
              weight: 'medium',
            }}
          />

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Category
          </AppText>
          <View style={styles.grid}>
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategoryId}
              setSelectedCategory={setSelectedCategoryId}
              colors={colors}
            />
          </View>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Date
          </AppText>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.dateBox}>
            <MaterialIcon name="calendar" size={24} color={colors.buttonText} />
            <AppText variant="md" style={styles.dateText}>
              {formatDate(expenseDate.toString())}
            </AppText>
          </TouchableOpacity>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Paid by
          </AppText>
          <View style={styles.toggleContainer}>
            <Button
              variant={paidByMe ? 'primary' : 'ghost'}
              title="You"
              onPress={() => setPaidByMe(true)}
              style={styles.toggleButton}
              textStyle={{fontSize: 14}}
            />
            <Button
              variant={!paidByMe ? 'primary' : 'ghost'}
              title="Someone else"
              onPress={() => setPaidByMe(false)}
              style={styles.toggleButton}
              textStyle={{fontSize: 14}}
            />
          </View>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Split type
          </AppText>
          <View style={styles.toggleContainer}>
            <Button
              variant={splitEqually ? 'primary' : 'ghost'}
              title="Equal"
              onPress={() => setSplitEqually(true)}
              style={styles.toggleButton}
              textStyle={{fontSize: 14}}
            />
            <Button
              variant={!splitEqually ? 'primary' : 'ghost'}
              title="Custom"
              onPress={() => setSplitEqually(false)}
              style={styles.toggleButton}
              textStyle={{fontSize: 14}}
            />
          </View>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Split with
          </AppText>
          <View style={styles.friendsContainer}>
            {selectedFriends.map(friend => (
              <View key={friend.id} style={styles.selectedFriend}>
                <MaterialIcon
                  name="account-circle"
                  size={40}
                  color={colors.mutedText}
                />
                <View style={styles.friendInfo}>
                  <AppText weight="medium">
                    {friend.firstName} {friend.lastName}
                  </AppText>
                </View>
                {!splitEqually ? (
                  <TextInput
                    style={styles.friendAmountInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={friend.amountOwed.toString()}
                    onChangeText={val => updateIndividualAmount(friend.id, val)}
                  />
                ) : (
                  <RupeeIcon
                    amount={friend.amountOwed}
                    size={14}
                    color={colors.primary}
                  />
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleToggleFriend(friend)}>
                  <MaterialIcon name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View
              style={[
                styles.searchContainer,
                {
                  borderBottomWidth: showFriendSelector ? 1 : 0,
                  borderBottomColor: colors.border,
                },
              ]}>
              <MaterialIcon name="at" size={20} color={colors.primary} />
              <TextInput
                style={styles.searchInputField}
                placeholder="Search friends..."
                placeholderTextColor={colors.mutedText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setShowFriendSelector(true)}
              />
              {searching && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
          </View>

          {showFriendSelector && (
            <View style={styles.friendSelector}>
              <ScrollView nestedScrollEnabled style={{maxHeight: 340}}>
                {/* Always show local friends */}
                <AppText variant="caption" style={styles.sectionLabel}>
                  Your Friends
                </AppText>
                {filteredLocalFriends.length > 0 ? (
                  filteredLocalFriends.map(friendItem => {
                    const isSelected = selectedFriends.some(
                      f => f.id === friendItem.id,
                    );
                    return (
                      <TouchableOpacity
                        key={friendItem.id}
                        style={[
                          styles.friendOption,
                          isSelected && styles.friendOptionSelected,
                        ]}
                        onPress={() => handleToggleFriend(friendItem)}>
                        <MaterialIcon
                          name="account-circle"
                          size={36}
                          color={colors.mutedText}
                        />
                        <View style={{marginLeft: 12}}>
                          <AppText weight="medium">
                            {friendItem.firstName} {friendItem.lastName}
                          </AppText>
                          <AppText variant="caption">
                            {friendItem.email}
                          </AppText>
                        </View>
                        {isSelected && (
                          <MaterialIcon
                            name="check-circle"
                            size={24}
                            color={colors.primary}
                            style={{marginLeft: 'auto'}}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <AppText
                    variant="caption"
                    style={{padding: 12, color: colors.mutedText}}>
                    {searchQuery.length > 0
                      ? 'No friends match your search'
                      : 'No friends found'}
                  </AppText>
                )}

                {/* Show global search results if available */}
                {searchResults.length > 0 && (
                  <>
                    <AppText variant="caption" style={styles.sectionLabel}>
                      Global Search
                    </AppText>
                    {searchResults.map(remoteUser => (
                      <View key={remoteUser.id} style={styles.friendOption}>
                        <MaterialIcon
                          name="account-circle"
                          size={36}
                          color={colors.mutedText}
                        />
                        <View style={{marginLeft: 12}}>
                          <AppText weight="medium">
                            {remoteUser.firstName} {remoteUser.lastName}
                          </AppText>
                          <AppText variant="caption">
                            {remoteUser.email}
                          </AppText>
                        </View>
                        <TouchableOpacity
                          style={styles.splinkButton}
                          onPress={() => initiateSplinkRequest(remoteUser)}>
                          {requestingSplink === remoteUser.id ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.primary}
                            />
                          ) : (
                            <AppText
                              variant="caption"
                              weight="semiBold"
                              style={{color: colors.primary}}>
                              Splink
                            </AppText>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          )}

          <Button
            title="Create Split Expense"
            onPress={handleCreateSplitExpense}
            loading={submitting}
            style={styles.submitButton}
          />
        </ScrollView>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={onDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          locale="en-IN"
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateSplitExpense;
