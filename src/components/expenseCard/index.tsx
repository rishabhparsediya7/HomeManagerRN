import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {formatDate} from '../../utils/formatDate';
import {category} from '../../constants';

const ExpenseCard = ({expense}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          {category
            .find(item => item.name === expense.category)
            ?.icon({
              width: 20,
              height: 20,
            })}
        </View>
        <View>
          <Text style={styles.category}>{expense.description}</Text>
          <Text style={styles.date}>{formatDate(expense.expenseDate)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          <FontAwesome name="rupee" size={16} color="green" />
          {Number(expense?.amount).toFixed(2)}
        </Text>
        <Text style={styles.method}>{expense?.paymentMethod}</Text>
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
