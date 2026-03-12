import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '@atoms/Button';
import Header from '@organisms/Header';
import CategorySelector from '@organisms/categorySelector';
import AppInput from '@molecules/AppInput';
import AppText from '@atoms/AppText';
import Icons from '@atoms/icons';
import SplitMethodSelector from '@organisms/splitMethodSelector/SplitMethodSelector';
import SegmentedControl from '@molecules/SegmentedControl';
import {category as expenseCategories} from '../../constants';
import {Participant, useSplitCalculator} from '../../hooks/useSplitCalculator';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import splitExpenseApi from '../../services/splitExpenseApi';
import {formatDate} from '../../utils/formatDate';
import {commonStyles} from '../../utils/styles';
import {createInitialsForImage} from '../../utils/users';

const GroupAddExpense = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {user: authUser} = useAuth();
  const [calendarDate, setCalendarDate] = useState(new Date());

  const groupId = route.params?.groupId;
  const members = route.params?.members || [];

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paidByMe, setPaidByMe] = useState(true);
  const [selectedPayerId, setSelectedPayerId] = useState(
    authUser?.userId || '',
  );
  const [inputWidth, setInputWidth] = useState(30);

  // Build participants from group members (include self)
  const participants: Participant[] = useMemo(
    () =>
      members.map((m: any) => ({
        userId: m.id,
        name: `${m.firstName} ${m.lastName}`,
        profilePicture: m.profilePicture,
        firstName: m.firstName,
      })),
    [members],
  );

  const splitCalc = useSplitCalculator({
    totalAmount: parseFloat(totalAmount) || 0,
    participants,
  });

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

  const handlePaidByOptionPress = (option: string) => {
    if (option === 'You') {
      setPaidByMe(true);
      setSelectedPayerId(authUser?.userId || '');
    } else {
      setPaidByMe(false);
      // Default to first member who is NOT me, if any
      const otherMember = members.find((m: any) => m.id !== authUser?.userId);
      if (otherMember) {
        setSelectedPayerId(otherMember.id);
      }
    }
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
    if (!splitCalc.validation.isValid) {
      Alert.alert(
        'Error',
        splitCalc.validation.message || 'Split amounts must match total',
      );
      return;
    }

    setSubmitting(true);
    try {
      // The person who physically paid is 'selectedPayerId'
      const res = await splitExpenseApi.create({
        description: description.trim(),
        totalAmount: parseFloat(totalAmount),
        category: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
        participants: splitCalc.splitResults.map(r => ({
          userId: r.userId,
          amountOwed: r.amountOwed,
        })),
        expenseDate: expenseDate.toISOString(),
        paidBy: selectedPayerId,
        groupId,
        splitType: splitCalc.splitMode,
      } as any);

      if (res.data?.success) {
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          (res.data as any)?.message || 'Failed to create expense',
        );
      }
    } catch (err: any) {
      console.error('Create group expense error:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create expense',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header title="Add Group Expense" showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* Large Amount Input Section (Premium Style) */}
          <View
            style={[
              styles.amountRow,
              {
                backgroundColor: colors.inputBackground,
                borderRadius: 12,
              },
            ]}>
            <AppText style={styles.rupee}>
              <Icon name="rupee" size={32} color={colors.buttonText} />
            </AppText>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.inputText + '80'}
              value={totalAmount}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              style={[styles.amountInput, {width: `${inputWidth}%`}]}
            />
          </View>

          {/* Title */}
          <AppInput
            label="Expense Title"
            placeholder="What was this for?"
            value={description}
            onChangeText={setDescription}
            containerStyle={{marginTop: 8}}
            labelProps={{
              variant: 'h6',
              weight: 'medium',
            }}
          />

          {/* Category */}
          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Category
          </AppText>
          <CategorySelector
            categories={expenseCategories}
            selectedCategory={selectedCategoryId}
            setSelectedCategory={setSelectedCategoryId}
            colors={colors}
          />

          {/* Date */}
          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Date
          </AppText>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.dateBox}>
            <Icons.CalendarIcon />
            <AppText variant="md" style={styles.dateText}>
              {formatDate(calendarDate.toString())}
            </AppText>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={expenseDate}
            onConfirm={date => {
              setExpenseDate(date);
              setCalendarDate(date);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />

          {/* Paid By */}
          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Paid By
          </AppText>
          <SegmentedControl
            options={['You', 'Someone else']}
            activeOption={paidByMe ? 'You' : 'Someone else'}
            onOptionPress={handlePaidByOptionPress}
          />

          {/* Member Selection for Payer (Visible when "Someone else" is selected) */}
          {!paidByMe && (
            <View style={styles.payerListContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.payerScrollContent}>
                {members
                  .filter((m: any) => m.id !== authUser?.userId)
                  .map((member: any) => {
                    const isSelected = selectedPayerId === member.id;
                    const fullName =
                      `${member.firstName || ''} ${
                        member.lastName || ''
                      }`.trim() || 'User';
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.payerItem,
                          isSelected && {
                            borderColor: colors.primary,
                            backgroundColor: colors.primary + '10',
                          },
                        ]}
                        onPress={() => setSelectedPayerId(member.id)}>
                        <View
                          style={[
                            styles.avatar,
                            {backgroundColor: colors.primary + '15'},
                          ]}>
                          {member.profilePicture &&
                          typeof member.profilePicture === 'string' &&
                          member.profilePicture.startsWith('http') ? (
                            <Image
                              source={{uri: member.profilePicture}}
                              style={styles.avatarImage}
                            />
                          ) : (
                            <AppText
                              variant="h6"
                              weight="bold"
                              style={{color: colors.primary}}>
                              {createInitialsForImage(fullName)}
                            </AppText>
                          )}
                          {isSelected && (
                            <View
                              style={[
                                styles.checkBadge,
                                {backgroundColor: colors.primary},
                              ]}>
                              <Icon name="check" size={10} color="#FFF" />
                            </View>
                          )}
                        </View>
                        <AppText
                          variant="sm"
                          weight={isSelected ? 'bold' : 'default'}
                          style={[
                            styles.payerName,
                            {color: isSelected ? colors.primary : colors.text},
                          ]}
                          numberOfLines={1}>
                          {member.firstName}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          )}

          {/* Split Method Selector */}
          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Split Between ({participants.length} people)
          </AppText>
          <SplitMethodSelector
            colors={colors}
            splitMode={splitCalc.splitMode}
            setSplitMode={splitCalc.setSplitMode}
            splitResults={splitCalc.splitResults}
            validation={splitCalc.validation}
            totalAmount={parseFloat(totalAmount) || 0}
            participants={participants}
            customAmounts={splitCalc.customAmounts}
            setCustomAmount={splitCalc.setCustomAmount}
            percentages={splitCalc.percentages}
            setPercentage={splitCalc.setPercentage}
            shares={splitCalc.shares}
            setShare={splitCalc.setShare}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.footer, {borderTopColor: colors.border}]}>
        <Button
          title="Add Group Expense"
          loading={submitting}
          disabled={!splitCalc.validation.isValid}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  amountRow: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
  },
  rupee: {
    fontSize: 36,
    ...commonStyles.textDefault,
  },
  amountInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 0, // Controlled by sectionTitle margins
    paddingBottom: 120,
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 24,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 10,
  },
  payerListContainer: {
    marginTop: 16,
  },
  payerScrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  payerItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 80,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  payerName: {
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
  },
});

export default GroupAddExpense;
