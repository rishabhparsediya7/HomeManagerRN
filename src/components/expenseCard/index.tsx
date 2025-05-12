import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ExpenseCard = ({expense}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Ionicons name={expense.icon} size={20} color="#3B82F6" />
        </View>
        <View>
          <Text style={styles.category}>{expense.category}</Text>
          <Text style={styles.date}>{expense.date}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
        <Text style={styles.method}>{expense.method}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 30,
    marginRight: 12,
  },
  category: {
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    color: '#6B7280',
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  method: {
    color: '#6B7280',
    fontSize: 13,
  },
});

export default ExpenseCard;
