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
import ExpenseCard from '../../components/expenseCard';
import FilterButton from '../../components/filterButton';
import Header from '../../components/Header';
import api from '../../services/api';
import {formatDMYDate} from '../../utils/formatDate';
import RupeeIcon from '../../components/rupeeIcon';
import Icon from 'react-native-vector-icons/Octicons';

const filterOptions = ['All', 'Today', 'Week', 'Month'];

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

const Expense = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseChange, setExpenseChange] = useState('');

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
      console.log(response.data?.data);
      const change = getExpenseChangeLabel(
        response.data?.totalMonthSum,
        response?.data?.previousMonthSum,
      );
      console.log(`Expense change: ${change}`);

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
    getExpenses();
  }, [selectedFilter]);

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
            <>
              <View style={styles.summaryCard}>
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
                    This month
                  </Text>
                  <View style={styles.summaryNote}>
                    <Text style={{color: 'white'}}>{expenseChange}</Text>
                    <Icon
                      name={
                        expenseChange.includes('less')
                          ? 'arrow-down'
                          : 'arrow-up'
                      }
                      size={18}
                      color={
                        expenseChange.includes('less') ? 'orange' : 'green'
                      }
                    />
                  </View>
                </View>
                <Text style={styles.summaryMonth}>
                  {formatDMYDate(new Date())}
                </Text>
              </View>
              <View style={styles.filters}>
                {filterOptions.map(option => (
                  <FilterButton
                    key={option}
                    label={option}
                    selected={selectedFilter === option}
                    onPress={() => setSelectedFilter(option)}
                  />
                ))}
              </View>
            </>
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
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={{paddingHorizontal: 16}}>
              <ExpenseCard expense={item} />
            </View>
          )}
          contentContainerStyle={{paddingBottom: 160}}
        />

        {/* <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryNote: {
    color: 'white',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryMonth: {
    color: 'white',
    fontSize: 14,
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
    backgroundColor: '#3B82F6',
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
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Expense;
