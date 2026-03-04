// screens/ExpensesScreen.js
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import AppGradient from '../../components/common/AppGradient';
import AppText from '../../components/common/AppText';
import Icon from 'react-native-vector-icons/Octicons';
import ExpenseCard from '../../components/expenseCard';
import SegmentedControl from '../../components/common/SegmentedControl';
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
      <AppGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View style={styles.totalAmount}>
            <RupeeIcon
              amount={totalExpense}
              size={28}
              textStyle={{color: 'white', fontSize: 28}}
              color="white"
            />
          </View>
          <AppText
            variant="h5"
            weight="semiBold"
            color="white"
            style={{marginTop: 8}}>
            {selectedFilter === 'All'
              ? 'All '
              : selectedFilter === 'Today'
              ? "Today's "
              : selectedFilter === 'Week'
              ? "Week's "
              : "Month's "}
            Expenses
          </AppText>
          <View style={styles.summaryNote}>
            <AppText color="white">{expenseChange}</AppText>
            <Icon
              name={expenseChange.includes('less') ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={expenseChange.includes('less') ? 'orange' : 'green'}
            />
          </View>
        </View>
      </AppGradient>

      <View style={styles.filters}>
        <SegmentedControl
          options={filterOptions}
          activeOption={selectedFilter}
          onOptionPress={setSelectedFilter}
        />
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          marginLeft: 20,
          marginBottom: 10,
        },
        summaryCard: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 12,
        },
        totalAmount: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
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
        summaryContent: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 20,
        },
        summaryMonth: {
          color: colors.text,
          fontSize: 14,
          ...commonStyles.textDefault,
          alignSelf: 'flex-start',
        },
        filters: {
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
          fontSize: 16,
        },
        contentContainerStyle: {
          paddingBottom: 20,
          paddingTop: 20,
        },
      }),
    [colors],
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
                <AppText>No expenses found.</AppText>
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
