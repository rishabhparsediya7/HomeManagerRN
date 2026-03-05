import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
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
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../../components/Button';
import CategorySelector from '../../components/categorySelector';
import AppInput from '../../components/common/AppInput';
import AppText from '../../components/common/AppText';
import Header from '../../components/Header';
import Icons from '../../components/icons';
import PaymentMethodSelector from '../../components/paymentMethodSelector';
import {category as expenseCategory} from '../../constants';
import {AuthorizeNavigationStackList} from '../../navigators/authorizeStack';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useHomeStore} from '../../store';
import api from '../../services/api';
import {formatDate} from '../../utils/formatDate';
import {commonStyles} from '../../utils/styles';

export const paymentMethods = [
  {
    id: '1',
    name: 'Cash',
    icon: <Icons.CashIcon />,
  },
  {
    id: '2',
    name: 'Credit Card',
    icon: <Icons.CreditCardIcon />,
  },
  {
    id: '3',
    name: 'Debit Card',
    icon: <Icons.DebitCardIcon />,
  },
];

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [inputWidth, setInputWidth] = useState(30);
  const [category, setCategory] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation =
    useNavigation<StackNavigationProp<AuthorizeNavigationStackList>>();
  const {addExpenseToRecent} = useHomeStore();

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, {duration: 1000}),
        withTiming(1, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulse.value}],
  }));

  const categories = useMemo(() => expenseCategory, []);

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
    setAmount(sanitized);
  };

  const handleConfirm = (date: Date) => {
    // const formattedDate = getDateTimeWithTimezone(date);
    setCalendarDate(date);
    setPaymentDate(date);
    setIsDatePickerVisible(false);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  const handleAddExpense = async () => {
    if (!amount || !note) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/expense/add', {
        amount,
        description: note,
        paymentMethod,
        expenseDate: paymentDate,
        category,
        paymentDate,
      });

      // Sync to home screen without extra API call
      const newExpense = response.data?.data;
      if (newExpense) {
        // Resolve IDs to display names (form state stores IDs, ExpenseCard needs names)
        const categoryName =
          categories.find(c => c.id === category)?.name || '';
        const paymentMethodName =
          paymentMethods.find(m => m.id === paymentMethod)?.name || '';
        addExpenseToRecent({
          ...newExpense,
          category: categoryName,
          paymentMethod: paymentMethodName,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAmount('');
      setNote('');
      setPaymentMethod('');
      // setPaymentDate(formatDMYDate(new Date()));
      setInputWidth(30);
      setCategory('');
      setLoading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: 12,
          paddingHorizontal: 20,
        },
        amountInput: {
          padding: 16,
          borderRadius: 12,
          color: colors.inputText,
          fontSize: 32,
          fontWeight: '600',
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        },
        cancel: {
          color: colors.buttonText,
          fontSize: 16,
        },
        header: {
          fontSize: 18,
          color: colors.buttonText,
          ...commonStyles.textDefault,
        },
        amountRow: {
          flex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
        },
        rupee: {
          fontSize: 36,
          ...commonStyles.textDefault,
          color: colors.buttonText,
        },
        amount: {
          fontSize: 36,
          ...commonStyles.textDefault,
          color: colors.buttonText,
        },
        sectionTitle: {
          marginBottom: 12,
          marginTop: 24,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        categoryItem: {
          width: '30%',
          backgroundColor: colors.inputBackground,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 12,
        },
        categoryLabel: {
          marginTop: 8,
          textAlign: 'center',
          fontSize: 12,
        },
        dateBox: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
          padding: 16,
          borderRadius: 12,
          color: colors.buttonText,
        },
        dateText: {
          marginLeft: 8,
          fontSize: 14,
          color: colors.buttonText,
        },
        notesInput: {
          minHeight: 80,
          textAlignVertical: 'top',
          color: colors.buttonText,
        },
        saveBtn: {
          backgroundColor: colors.buttonBackground,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginTop: 24,
        },
        saveText: {
          color: colors.buttonText,
          fontSize: 16,
          ...commonStyles.textDefault,
        },
      }),
    [theme],
  );
  const isDisabled = useMemo(() => {
    return !amount || !note;
  }, [amount, note]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <Header
        title="Create"
        showDrawerButton={true}
        rightComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('QuickAddExpense')}>
            <Icons.AIStarIcon size={32} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={{paddingBottom: 12}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>
              <Icon name="rupee" size={32} color={colors.buttonText} />
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.inputText + '80'}
              value={amount}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              style={[styles.amountInput, {width: `${inputWidth}%`}]}
            />
          </View>

          <AppInput
            containerStyle={{marginTop: 24}}
            label="Expense Title"
            placeholder="What did you spend on?"
            value={note}
            onChangeText={setNote}
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
              selectedCategory={category}
              setSelectedCategory={setCategory}
              colors={colors}
            />
          </View>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Date
          </AppText>
          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(true)}
            style={styles.dateBox}>
            <Icons.CalendarIcon />
            <AppText variant="md" style={styles.dateText}>
              {formatDate(calendarDate.toString())}
            </AppText>
          </TouchableOpacity>

          <AppText variant="h6" weight="medium" style={styles.sectionTitle}>
            Payment Method
          </AppText>
          <View style={styles.grid}>
            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedPaymentMethod={paymentMethod}
              setSelectedPaymentMethod={setPaymentMethod}
              colors={colors}
            />
          </View>

          <Button
            disabled={isDisabled}
            onPress={handleAddExpense}
            title="Save Expense"
            loading={loading}
            style={styles.saveBtn}
          />
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          locale="en-IN"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddExpenseScreen;
