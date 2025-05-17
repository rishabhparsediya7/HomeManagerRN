// screens/ExpensesScreen.js
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExpenseCard from '../../components/expenseCard';
import FilterButton from '../../components/filterButton';
import Header from '../../components/Header';
import api from '../../services/api';
import {useFocusEffect} from '@react-navigation/native';

// const expenses = [
//   {
//     id: '1',
//     category: 'Food & Dining',
//     date: 'Today, 2:30 PM',
//     amount: 24.5,
//     method: 'Credit Card',
//     icon: 'fast-food-outline',
//   },
//   {
//     id: '2',
//     category: 'Transportation',
//     date: 'Today, 9:15 AM',
//     amount: 32.0,
//     method: 'Cash',
//     icon: 'car-outline',
//   },
//   {
//     id: '3',
//     category: 'Shopping',
//     date: 'Yesterday',
//     amount: 156.75,
//     method: 'Debit Card',
//     icon: 'cart-outline',
//   },
//   {
//     id: '4',
//     category: 'Food & Dining',
//     date: 'Today, 2:30 PM',
//     amount: 24.5,
//     method: 'Credit Card',
//     icon: 'fast-food-outline',
//   },
//   {
//     id: '5',
//     category: 'Transportation',
//     date: 'Today, 9:15 AM',
//     amount: 32.0,
//     method: 'Cash',
//     icon: 'car-outline',
//   },
//   {
//     id: '6',
//     category: 'Shopping',
//     date: 'Yesterday',
//     amount: 156.75,
//     method: 'Debit Card',
//     icon: 'cart-outline',
//   },
//   {
//     id: '7',
//     category: 'Food & Dining',
//     date: 'Today, 2:30 PM',
//     amount: 24.5,
//     method: 'Credit Card',
//     icon: 'fast-food-outline',
//   },
//   {
//     id: '8',
//     category: 'Transportation',
//     date: 'Today, 9:15 AM',
//     amount: 32.0,
//     method: 'Cash',
//     icon: 'car-outline',
//   },
//   {
//     id: '9',
//     category: 'Shopping',
//     date: 'Yesterday',
//     amount: 156.75,
//     method: 'Debit Card',
//     icon: 'cart-outline',
//   },
// ];

const filterOptions = ['All', 'Today', 'Week', 'Month'];

const Expense = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const getExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/expense');
      setExpenses(response.data?.data);
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
                  <Text style={styles.totalAmount}>$2,459.50</Text>
                  <Text style={styles.summaryNote}>
                    12% less than last month
                  </Text>
                </View>
                <Text style={styles.summaryMonth}>February 2024</Text>
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
          renderItem={({item}) => <ExpenseCard expense={item} />}
          contentContainerStyle={{paddingBottom: 160}}
        />

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
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
