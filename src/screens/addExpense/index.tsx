import React, {useState} from 'react';
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

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff'}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.cancel}>Cancel</Text>
          <Text style={styles.header}>Add Expense</Text>
          <Text style={{color: 'transparent'}}>Cancel</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.dollar}>$</Text>
          <Text style={styles.amount}>{amount || '0.00'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.grid}>
          {[
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Bills & Utilities',
            'Entertainment',
            'Others',
          ].map((cat, idx) => (
            <View style={styles.categoryItem} key={idx}>
              <Svg width={24} height={24} fill="none">
                <Path
                  d="M2 12h20"
                  stroke="#3366FF"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.categoryLabel}>{cat}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Date</Text>
        <View style={styles.dateBox}>
          <Svg width={20} height={20} fill="none">
            <Path
              d="M3 5h14v12H3z"
              stroke="#3366FF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.dateText}>Today, Feb 15, 2024</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.grid}>
          {['Cash', 'Credit Card', 'Debit Card'].map((method, idx) => (
            <View style={styles.categoryItem} key={idx}>
              <Svg width={24} height={24} fill="none">
                <Path
                  d="M2 12h20"
                  stroke="#3366FF"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.categoryLabel}>{method}</Text>
            </View>
          ))}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dollar: {
    fontSize: 30,
    color: '#888',
    marginRight: 4,
  },
  amount: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000',
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
