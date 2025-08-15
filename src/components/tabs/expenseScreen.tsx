import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RupeeIcon from '../../components/rupeeIcon';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {ExpenseDataProps} from '../../screens/home';
import api from '../../services/api';
import {getMonthStartAndEndDates} from '../../utils/dates';
import {commonStyles} from '../../utils/styles';
import {Icon} from 'react-native-vector-icons/Icon';

export type filterType =
  | 'Custom'
  | 'Today'
  | 'Week'
  | 'Month'
  | 'Category'
  | 'Year'
  | 'Payment Method';

const exportDataListItem = ({
  item,
  styles,
  colors,
}: {
  item: ExpenseDataProps;
  styles: any;
  colors: any;
}) => {
  return (
    <View style={styles.dataContainer}>
      <View style={styles.columns}>
        <Text numberOfLines={2} style={styles.text}>
          {item?.description}
        </Text>
      </View>
      <View style={styles.columns}>
        <Text numberOfLines={2} style={styles.text}>
          {item?.paymentMethod}
        </Text>
      </View>
      <View style={[styles.columns, {justifyContent: 'flex-end'}]}>
        <Text numberOfLines={2} style={styles.text}>
          {new Date(item?.expenseDate)
            ?.toLocaleDateString('en-GB')
            ?.replace(/\//g, '-')}
        </Text>
      </View>
      <View style={[styles.columns, {justifyContent: 'flex-end'}]}>
        <Text numberOfLines={2} style={styles.text}>
          <RupeeIcon
            amount={Number(item?.amount)}
            textStyle={styles.text}
            color={colors.buttonText}
          />
        </Text>
      </View>
    </View>
  );
};

const ExpenseScreen = ({
  filter,
  paymentMethodId,
  categoryId,
  handleClearFilters,
  setFilterQuery,
}: {
  filter: string;
  paymentMethodId?: string;
  categoryId?: string;
  handleClearFilters: () => void;
  setFilterQuery: (query: string) => void;
}) => {
  const {startDate, endDate} = getMonthStartAndEndDates();
  const [recentExpenses, setRecentExpenses] = useState<ExpenseDataProps[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const limit = 10;

  const query = useMemo(() => {
    let query = `/api/expense?limit=${limit}`;
    if (filter === 'Custom') {
      query = `/api/expense?filter=${filter.toLowerCase()}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`;
    } else if (filter === 'Today') {
      query = `/api/expense?filter=${filter.toLowerCase()}&limit=${limit}&endDate=${Date.now()}`;
    } else if (filter === 'Week') {
      query = `/api/expense?filter=${filter.toLowerCase()}&limit=${limit}&endDate=${Date.now()}`;
    } else if (filter === 'Month') {
      query = `/api/expense?filter=${filter.toLowerCase()}&limit=${limit}&endDate=${Date.now()}`;
    } else if (filter === 'Year') {
      query = `/api/expense?filter=${filter.toLowerCase()}&limit=${limit}&endDate=${Date.now()}`;
    }

    if (categoryId) {
      query += `&categoryId=${categoryId}`;
    }
    if (paymentMethodId) {
      query += `&paymentMethodId=${paymentMethodId}`;
    }
    setFilterQuery(query);
    return query;
  }, [filter, startDate, endDate, limit, paymentMethodId, categoryId]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    let cloneQuery = query;
    try {
      let expenseQuery = api.get(cloneQuery);
      const response = await expenseQuery;
      const data = response.data?.data;
      setRecentExpenses(data);
      setTotalExpense(response.data?.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const getExpenses = async () => {
      fetchExpenses();
    };
    getExpenses();
  }, [query]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    dataContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    text: {
      fontSize: 16,
      color: colors.inputText,
      ...commonStyles.textDefault,
    },
    columns: {
      flexDirection: 'row',
      flex: 1,
      flexBasis: '25%',
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    separator: {
      height: 1,
      backgroundColor: colors.inputText,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalText: {
      fontSize: 16,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    clearButton: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    clearButtonText: {
      fontSize: 16,
      color: colors.primary,
      ...commonStyles.textDefault,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.buttonText} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear Filters</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <View style={[styles.columns, {justifyContent: 'center'}]}>
          <Text numberOfLines={2} style={styles.text}>
            {'Description'}
          </Text>
        </View>
        <View style={[styles.columns, {justifyContent: 'center'}]}>
          <Text numberOfLines={2} style={styles.text}>
            {'Payment'}
          </Text>
        </View>
        <View style={[styles.columns, {justifyContent: 'center'}]}>
          <Text numberOfLines={2} style={styles.text}>
            {'Date'}
          </Text>
        </View>
        <View style={[styles.columns, {justifyContent: 'flex-end'}]}>
          <Text numberOfLines={2} style={styles.text}>
            {'Amount'}
          </Text>
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.container}
        data={recentExpenses}
        renderItem={({item}) => exportDataListItem({item, styles, colors})}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => <View style={styles.emptyContainer} />}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total Expenses: {recentExpenses.length}
        </Text>
        <Text style={styles.totalText}>Total Amount: {totalExpense}</Text>
      </View>
    </View>
  );
};

export default React.memo(ExpenseScreen);
