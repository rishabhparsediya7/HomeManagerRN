import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icons from '../../components/icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {category as expenseCategory} from '../../constants';
import PaymentMethodSelector from '../../components/paymentMethodSelector';

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [inputWidth, setInputWidth] = useState(30);
  const [category, setCategory] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const categories = useMemo(() => expenseCategory, []);

  const paymentMethods = useMemo(
    () => [
      {
        name: 'Cash',
        icon: <Icons.CashIcon />,
      },
      {
        name: 'Credit Card',
        icon: <Icons.CreditCardIcon />,
      },
      {
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
    setPaymentDate(date);
    setIsDatePickerVisible(false);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <Header title="Add Expense" showBackButton onBackPress={() => {}} />
        <View style={styles.container}>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>
              <Icon name="rupee" size={32} color="#888" />
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#999"
              value={amount}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              style={[styles.amountInput, {width: `${inputWidth}%`}]} // Use template literal to convert number to string
            />
          </View>

          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.grid}>
            {categories.map((cat, idx) => (
              <TouchableOpacity
                onPress={() => setCategory(cat.id)}
                style={styles.categoryItem}
                key={idx}>
                {<cat.icon />}
                <Text style={styles.categoryLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(true)}
            style={styles.dateBox}>
            <Icons.CalendarIcon />
            <Text style={styles.dateText}>
              {paymentDate.toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.grid}>
            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedPaymentMethod={paymentMethod}
              setSelectedPaymentMethod={setPaymentMethod}
            />
          </View>

          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add a note..."
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Expense</Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  amountInput: {
    padding: 16,
    borderRadius: 12,
    color: '#000',
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
    color: '#3366FF',
    fontSize: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountRow: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rupee: {
    fontSize: 36,
    color: '#888',
    fontWeight: '600',
  },
  amount: {
    fontSize: 36,
    fontWeight: '600',
    color: '#888',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#F5F6FA',
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
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  notesInput: {
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#000',
  },
  saveBtn: {
    backgroundColor: '#3366FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
