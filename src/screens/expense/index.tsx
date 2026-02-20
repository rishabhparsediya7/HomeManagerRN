// screens/ExpensesScreen.js
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Octicons';
import ExpenseCard from '../../components/expenseCard';
import FilterButton from '../../components/filterButton';
import Header from '../../components/Header';
import RupeeIcon from '../../components/rupeeIcon';
import {lightTheme} from '../../providers/Theme';
import api from '../../services/api';
import {commonStyles} from '../../utils/styles';

const filterOptions = ['All', 'Today', 'Week', 'Month'];

//helper function to get expense change label
function getExpenseChangeLabel(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return 'No change from last month';
    return '100% more than last month';
  }

  const change = ((current - previous) / previous) * 100;
  const absChange = Math.abs(change).toFixed(2);

  if (change > 0) {
    return `${absChange}% more than last month`;
  } else if (change < 0) {
    return `${absChange}% less than last month`;
  } else {
    return 'No change from last month';
  }
}

// ListHeaderComponent
const ListHeaderComponent = ({
  selectedFilter,
  totalExpense,
  expenseChange,
  setSelectedFilter,
  styles,
  colors,
}: {
  selectedFilter: string;
  totalExpense: number;
  expenseChange: string;
  setSelectedFilter: (filter: string) => void;
  styles: any;
  colors: any;
}) => {
  return (
    <>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={['#34D399', '#10B981', '#06B6D4', '#22C55E']}
        style={styles.summaryCard}>
        <View>
          <Text style={styles.totalAmount}>
            <RupeeIcon
              amount={totalExpense}
              size={28}
              textStyle={{color: 'white', fontSize: 28}}
              color="white"
            />
          </Text>
          <Text
            style={[
              styles.summaryMonth,
              {fontSize: 18, marginTop: 8, fontWeight: '600'},
            ]}>
            {selectedFilter === 'All'
              ? 'All '
              : selectedFilter === 'Today'
              ? "Today's "
              : selectedFilter === 'Week'
              ? "Week's "
              : "Month's "}
            Expenses
          </Text>
          <View style={styles.summaryNote}>
            <Text style={{color: 'white'}}>{expenseChange}</Text>
            <Icon
              name={expenseChange.includes('less') ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={expenseChange.includes('less') ? 'orange' : 'green'}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filters}>
        {filterOptions.map(option => (
          <FilterButton
            key={option}
            label={option}
            selected={selectedFilter === option}
            onPress={() => setSelectedFilter(option)}
            colors={colors}
          />
        ))}
      </View>
    </>
  );
};

// renderItem
const renderItem = ({item}: {item: any}) => (
  <View style={{paddingHorizontal: 16}}>
    <ExpenseCard expense={item} />
  </View>
);

// Expense
const Expense = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseChange, setExpenseChange] = useState('');
  const colors = lightTheme;

  const getExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/expense', {
        params: {
          filter: selectedFilter.toLowerCase(),
          t: Date.now(), // cache buster
        },
        headers: {'Cache-Control': 'no-cache'},
      });
      setExpenses(response.data?.data);
      const change = getExpenseChangeLabel(
        response.data?.totalMonthSum,
        response?.data?.previousMonthSum,
      );

      setTotalExpense(response.data?.totalSum);
      setExpenseChange(change);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getExpenses();
    }, []),
  );

  useEffect(() => {
    if (selectedFilter) setExpenses([]);
    getExpenses();
  }, [selectedFilter]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 22,
      color: colors.text,
      ...commonStyles.textDefault,
      marginLeft: 20,
      marginBottom: 10,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      marginHorizontal: 20,
      borderRadius: 12,
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    totalAmount: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    summaryNote: {
      color: colors.text,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    summaryMonth: {
      color: colors.text,
      fontSize: 14,
      ...commonStyles.textDefault,
      alignSelf: 'flex-start',
    },
    filters: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    addButton: {
      position: 'absolute',
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      bottom: 80,
      left: 20,
      right: 20,
    },
    addButtonText: {
      color: colors.text,
      marginLeft: 8,
      ...commonStyles.textDefault,
      fontSize: 16,
    },
    contentContainerStyle: {
      paddingBottom: 20,
      paddingTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        title="Expenses"
        showNotification
        showImage
        image="https://randomuser.me/api/portraits/men/32.jpg"
      />
      <View style={styles.container}>
        <FlatList
          data={expenses || []}
          onRefresh={getExpenses}
          refreshing={loading}
          ListHeaderComponent={
            <ListHeaderComponent
              setSelectedFilter={setSelectedFilter}
              selectedFilter={selectedFilter}
              totalExpense={totalExpense}
              expenseChange={expenseChange}
              styles={styles}
              colors={colors}
            />
          }
          ListEmptyComponent={
            loading ? (
              <View style={{padding: 20, alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text>No expenses found.</Text>
              </View>
            )
          }
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainerStyle}
        />
      </View>
    </View>
  );
};

export default Expense;
