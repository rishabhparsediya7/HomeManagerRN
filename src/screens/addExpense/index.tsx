import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import CategorySelector from '../../components/categorySelector';
import Header from '../../components/Header';
import Icons from '../../components/icons';
import PaymentMethodSelector from '../../components/paymentMethodSelector';
import {category as expenseCategory} from '../../constants';
import api from '../../services/api';
import {formatDMYDate} from '../../utils/formatDate';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { commonStyles } from '../../utils/styles';

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
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  
  const categories = useMemo(() => expenseCategory, []);

  const paymentMethods = useMemo(
    () => [
      {
        id: 1,
        name: 'Cash',
        icon: <Icons.CashIcon />,
      },
      {
        id: 2,
        name: 'Credit Card',
        icon: <Icons.CreditCardIcon />,
      },
      {
        id: 3,
        name: 'Debit Card',
        icon: <Icons.DebitCardIcon />,
      },
    ],
    [],
  );

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
    if (!amount || !paymentMethod || !paymentDate || !category || !note) {
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

      console.log(response.data);
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    amountInput: {
      padding: 16,
      borderRadius: 12,
      color: colors.inputBackground,
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
      fontSize: 16,
      ...commonStyles.textDefault,
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
    },
    dateText: {
      marginLeft: 8,
      fontSize: 14,
    },
    notesInput: {
      backgroundColor: colors.inputBackground,
      padding: 16,
      borderRadius: 12,
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
  }), [theme]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <Header title="Add Expense" onBackPress={() => {}} />
        <View style={styles.container}>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>
              <Icon name="rupee" size={32} color={colors.buttonText} />
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.inputText}
              value={amount}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              style={[styles.amountInput, {width: `${inputWidth}%`}]} // Use template literal to convert number to string
            />
          </View>

          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.grid}>
            <CategorySelector
              categories={categories}
              selectedCategory={category}
              setSelectedCategory={setCategory}
              colors={colors}
            />
          </View>

          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(true)}
            style={styles.dateBox}>
            <Icons.CalendarIcon />
            <Text style={styles.dateText}>{formatDMYDate(calendarDate)}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.grid}>
            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedPaymentMethod={paymentMethod}
              setSelectedPaymentMethod={setPaymentMethod}
              colors={colors}
            />
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add a note..."
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity onPress={handleAddExpense} style={styles.saveBtn}>
            <Text style={styles.saveText}>
              {loading ? <ActivityIndicator /> : 'Save Expense'}
            </Text>
          </TouchableOpacity>
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


