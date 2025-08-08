import React, { useMemo } from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {formatDate} from '../../utils/formatDate';
import {category} from '../../constants';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { commonStyles } from '../../utils/styles';
import RupeeIcon from '../../components/rupeeIcon';

const ExpenseCard = ({expense}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => StyleSheet.create({
    container: {
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
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 30,
      marginRight: 12,
    },
    category: {
      ...commonStyles.textDefault,
      fontSize: 16,
      textTransform: 'capitalize',
      color: colors.buttonText,
    },
    date: {
      ...commonStyles.textDefault,
      fontSize: 13,
      color: colors.buttonText,
    },
    right: {
      alignItems: 'flex-end',
    },
    amount: {
      ...commonStyles.textDefault,
      fontSize: 16,
      color: colors.buttonText,
    },
    method: {
      ...commonStyles.textDefault,
      fontSize: 13,
      color: colors.buttonText,
    },
  }), [theme]);
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
        <RupeeIcon amount={expense?.amount} textStyle={styles.amount} />
        <Text style={styles.method}>{expense?.paymentMethod}</Text>
      </View>
    </View>
  );
};

export default ExpenseCard;
