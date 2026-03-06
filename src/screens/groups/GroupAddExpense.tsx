import React, {useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import CategorySelector from '../../components/categorySelector';
import SplitMethodSelector from '../../components/splitMethodSelector/SplitMethodSelector';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import {useSplitCalculator, Participant} from '../../hooks/useSplitCalculator';
import splitExpenseApi from '../../services/splitExpenseApi';
import {useNavigation, useRoute} from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {formatDate} from '../../utils/formatDate';
import {category as expenseCategories} from '../../constants';

const GroupAddExpense = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {user: authUser} = useAuth();

  const groupId = route.params?.groupId;
  const members = route.params?.members || [];

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paidByMe, setPaidByMe] = useState(true);

  // Build participants from group members (include self)
  const participants: Participant[] = members.map((m: any) => ({
    userId: m.id,
    name: `${m.firstName} ${m.lastName}`,
    profilePicture: m.profilePicture,
  }));

  const splitCalc = useSplitCalculator({
    totalAmount: parseFloat(totalAmount) || 0,
    participants,
  });

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
      const res = await splitExpenseApi.create({
        description: description.trim(),
        totalAmount: parseFloat(totalAmount),
        category: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
        participants: splitCalc.splitResults.map(r => ({
          userId: r.userId,
          amountOwed: r.amountOwed,
        })),
        expenseDate: expenseDate.toISOString(),
        paidBy: paidByMe ? authUser!.userId : participants[0]?.userId || '',
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
          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: colors.text}]}>
              Description *
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
              placeholder="What was the expense for?"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: colors.text}]}>
              Total Amount *
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currency, {color: colors.primary}]}>₹</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.amountInput,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.inputBorder,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={setTotalAmount}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <CategorySelector
              categories={expenseCategories}
              selectedCategory={selectedCategoryId}
              setSelectedCategory={setSelectedCategoryId}
              colors={colors}
            />
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: colors.text}]}>Date</Text>
            <TouchableOpacity
              style={[
                styles.dateBtn,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
              onPress={() => setDatePickerVisibility(true)}>
              <Icon
                name="calendar-outline"
                size={18}
                color={colors.mutedText}
              />
              <Text style={[styles.dateText, {color: colors.text}]}>
                {formatDate(expenseDate.toISOString())}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={expenseDate}
            onConfirm={date => {
              setExpenseDate(date);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />

          {/* Paid By */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: colors.text}]}>Paid By</Text>
            <View style={styles.paidByRow}>
              <TouchableOpacity
                style={[
                  styles.paidByOption,
                  {
                    backgroundColor: paidByMe
                      ? colors.primary
                      : colors.inputBackground,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setPaidByMe(true)}>
                <Text
                  style={{
                    color: paidByMe ? '#FFFFFF' : colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  You
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paidByOption,
                  {
                    backgroundColor: !paidByMe
                      ? colors.primary
                      : colors.inputBackground,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setPaidByMe(false)}>
                <Text
                  style={{
                    color: !paidByMe ? '#FFFFFF' : colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  Someone else
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Split Method Selector */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: colors.text}]}>
              Split Between ({participants.length} people)
            </Text>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.footer, {borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: splitCalc.validation.isValid
                ? colors.primary
                : colors.primary + '40',
            },
          ]}
          onPress={handleSubmit}
          disabled={submitting || !splitCalc.validation.isValid}
          activeOpacity={0.8}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Add Expense</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  field: {
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 22,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 15,
  },
  paidByRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paidByOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupAddExpense;
