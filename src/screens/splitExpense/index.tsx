import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import RupeeIcon from '../../components/rupeeIcon';
import {useAuth} from '../../providers/AuthProvider';
import {lightTheme} from '../../providers/Theme';
import splitExpenseApi, {SplitExpense} from '../../services/splitExpenseApi';
import {commonStyles} from '../../utils/styles';

type FilterType = 'all' | 'youOwe' | 'owedToYou' | 'settled';

const filterOptions: {key: FilterType; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'youOwe', label: 'You Owe'},
  {key: 'owedToYou', label: 'Owed to You'},
  {key: 'settled', label: 'Settled'},
];

const SplitExpenseList = () => {
  const navigation = useNavigation<any>();
  const {user} = useAuth();
  const colors = lightTheme;

  const [expenses, setExpenses] = useState<SplitExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await splitExpenseApi.getList();
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching split expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, []),
  );

  const getFilteredExpenses = () => {
    if (!user?.userId) return expenses;

    switch (selectedFilter) {
      case 'youOwe':
        return expenses.filter(expense => {
          const participant = expense.participants?.find(
            p => p.userId === user.userId,
          );
          return (
            participant &&
            !participant.isPayer &&
            participant.status !== 'settled'
          );
        });
      case 'owedToYou':
        return expenses.filter(expense => {
          const isCreator = expense.createdBy === user.userId;
          return isCreator && expense.status !== 'settled';
        });
      case 'settled':
        return expenses.filter(expense => expense.status === 'settled');
      default:
        return expenses;
    }
  };

  const getAmountDisplay = (expense: SplitExpense) => {
    if (!user?.userId) return {amount: 0, type: 'neutral'};

    const participant = expense.participants?.find(
      p => p.userId === user.userId,
    );

    if (participant?.isPayer) {
      // User paid, calculate what others owe them
      const totalOwed =
        expense.participants
          ?.filter(p => !p.isPayer && p.status !== 'settled')
          .reduce((sum, p) => sum + (p.amountOwed - (p.amountPaid || 0)), 0) ||
        0;
      return {amount: totalOwed, type: 'positive'};
    } else if (participant) {
      // User owes money
      const remaining = participant.amountOwed - (participant.amountPaid || 0);
      return {amount: remaining, type: remaining > 0 ? 'negative' : 'neutral'};
    }

    return {amount: 0, type: 'neutral'};
  };

  const renderExpenseCard = ({item}: {item: SplitExpense}) => {
    const themeColors = lightTheme;
    const {amount, type} = getAmountDisplay(item);
    const amountColor =
      type === 'positive'
        ? '#22c55e'
        : type === 'negative'
        ? '#ef4444'
        : themeColors.text;

    return (
      <TouchableOpacity
        style={[
          localStyles.card,
          {backgroundColor: themeColors.cardBackground},
        ]}
        onPress={() =>
          navigation.navigate('SplitExpenseDetail', {splitExpenseId: item.id})
        }>
        <View style={localStyles.cardHeader}>
          <View style={localStyles.cardTitleSection}>
            <Text
              style={[localStyles.cardTitle, {color: themeColors.text}]}
              numberOfLines={1}>
              {item.description}
            </Text>
            <Text
              style={[localStyles.cardCreator, {color: themeColors.mutedText}]}>
              by {item.creatorName || 'You'}
            </Text>
          </View>
          <View style={localStyles.cardAmountSection}>
            <Text style={[localStyles.cardAmount, {color: amountColor}]}>
              {type === 'negative'
                ? 'You owe'
                : type === 'positive'
                ? 'You get back'
                : ''}
            </Text>
            <RupeeIcon
              amount={amount}
              size={18}
              color={amountColor}
              textStyle={{color: amountColor, fontWeight: 'bold'}}
            />
          </View>
        </View>
        <View style={localStyles.cardFooter}>
          <Text
            style={[
              localStyles.cardParticipants,
              {color: themeColors.mutedText},
            ]}>
            <Icon
              name="account-group"
              size={14}
              color={themeColors.mutedText}
            />{' '}
            {item.participants?.length || 0} people
          </Text>
          <View
            style={[
              localStyles.statusBadge,
              {
                backgroundColor:
                  item.status === 'settled'
                    ? '#22c55e20'
                    : item.status === 'partially_settled'
                    ? '#f59e0b20'
                    : '#3b82f620',
              },
            ]}>
            <Text
              style={[
                localStyles.statusText,
                {
                  color:
                    item.status === 'settled'
                      ? '#22c55e'
                      : item.status === 'partially_settled'
                      ? '#f59e0b'
                      : '#3b82f6',
                },
              ]}>
              {item.status === 'settled'
                ? 'Settled'
                : item.status === 'partially_settled'
                ? 'Partial'
                : 'Pending'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonInactive: {
      borderColor: colors.border,
    },
    filterTextInactive: {
      color: colors.text,
    },
    balanceButton: {
      backgroundColor: colors.primary + '20',
    },
    balanceButtonText: {
      color: colors.primary,
    },
    fab: {
      backgroundColor: colors.primary,
    },
    emptyText: {
      color: colors.mutedText,
    },
  };

  return (
    <View style={[localStyles.container, dynamicStyles.container]}>
      <Header
        title="Split Expenses"
        showBackButton
        onBackPress={() => navigation.canGoBack() && navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={[localStyles.balanceButton, dynamicStyles.balanceButton]}
            onPress={() => navigation.navigate('Balances')}>
            <Icon name="scale-balance" size={18} color={colors.primary} />
            <Text
              style={[
                localStyles.balanceButtonText,
                dynamicStyles.balanceButtonText,
              ]}>
              Balances
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Filter tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={localStyles.filterContainer}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                localStyles.filterButton,
                selectedFilter === option.key
                  ? dynamicStyles.filterButtonActive
                  : dynamicStyles.filterButtonInactive,
              ]}
              onPress={() => setSelectedFilter(option.key)}>
              <Text
                style={[
                  localStyles.filterText,
                  selectedFilter === option.key
                    ? localStyles.filterTextActive
                    : dynamicStyles.filterTextInactive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Expenses list */}
      <FlatList
        data={getFilteredExpenses()}
        keyExtractor={item => item.id}
        renderItem={renderExpenseCard}
        refreshing={loading}
        onRefresh={fetchExpenses}
        contentContainerStyle={{paddingBottom: 80}}
        ListEmptyComponent={
          loading ? (
            <View style={localStyles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={localStyles.emptyContainer}>
              <Icon name="receipt" size={48} color={colors.mutedText} />
              <Text style={[localStyles.emptyText, dynamicStyles.emptyText]}>
                No split expenses yet
              </Text>
            </View>
          )
        }
      />

      {/* FAB to create new */}
      <TouchableOpacity
        style={[localStyles.fab, dynamicStyles.fab]}
        onPress={() => navigation.navigate('CreateSplitExpense')}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    ...commonStyles.textDefault,
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    ...commonStyles.textDefault,
  },
  cardCreator: {
    fontSize: 12,
    marginTop: 2,
  },
  cardAmountSection: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: 12,
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardParticipants: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  balanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  balanceButtonText: {
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default SplitExpenseList;
