import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import ExpenseCard from '../../components/expenseCard';
import Input from '../../components/form/input';
import Header from '../../components/Header';
import {Modal} from '../../components/modal';
import RupeeIcon from '../../components/rupeeIcon';
import {COLORS} from '../../providers/theme.style';
import api from '../../services/api';
import {getMonthStartAndEndDates} from '../../utils/dates';
import {category} from '../../constants';

interface ExpenseDataProps {
  amount: string;
  category: string;
  categoryId: number;
  createdAt: string;
  description: string;
  expenseDate: string;
  id: string;
  paymentMethod: string;
  paymentMethodId: number;
  updatedAt: string;
  userId: string;
}

const mapExpenseDataToChart = rawExpenseData => {
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return rawExpenseData.map((item, index) => ({
    label: weekLabels[index],
    height: 10 + parseFloat(item.totalamount),
  }));
};

const mapCategoryExpensePercentageToChartData = (categoryData: any) => {
  return categoryData.map(cat => ({
    label: cat.name,
    percentage: cat.percentage,
    amount: cat.amount,
    icon: category
      .find(item => item.name === cat.name)
      ?.icon({
        width: 20,
        height: 20,
      }),
  }));
};

const Home = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {startDate, endDate} = getMonthStartAndEndDates();
  const [recentExpenses, setRecentExpenses] = useState<ExpenseDataProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [actionPlaceHolder, setActionPlaceHolder] = useState('');
  const [actionType, setActionType] = useState<'income' | 'bills' | 'budget'>();
  const [weekChartData, setWeekChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const onBudgetChange = (text: string) => {
    setBudget(Number(text));
  };

  const onTotalIncomeChange = (text: string) => {
    setTotalIncome(Number(text));
  };

  const [monthSummary, setMonthSummary] = useState<{
    totalExpenses: number;
    totalIncome: number;
    totalBudget: number;
  }>({
    totalExpenses: 0,
    totalIncome: 0,
    totalBudget: 0,
  });
  const limit = 4;
  const filter = 'custom';

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      let expenseQuery = api.get(
        `/api/expense?filter=${filter}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      );
      let chartQuery = api.get(`/api/expense/getWeekChart`);
      let categoryQuery = api.get(`/api/expense/getExpenseByCategory`);
      const [response, chartResponse, categoryResponse] = await Promise.all([
        expenseQuery,
        chartQuery,
        categoryQuery,
      ]);
      const data = response.data.lastFourExpenses;
      const chartData = chartResponse.data?.data || [];
      const categoryData = categoryResponse.data?.data || [];
      setRecentExpenses(data);
      setMonthSummary({
        totalExpenses: Number(response.data?.totalMonthSum || 0),
        totalIncome: Number(response.data?.totalIncome || 0),
        totalBudget: Number(response.data?.budget || 0),
      });
      const updatedChartData = mapExpenseDataToChart(chartData);
      const updatedCategoryData =
        mapCategoryExpensePercentageToChartData(categoryData);

      setWeekChartData(updatedChartData);
      setCategoryChartData(updatedCategoryData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate, limit]);

  const openActionModal = (type: 'income' | 'bills' | 'budget') => {
    if (type === 'income') {
      setActionPlaceHolder('Enter your income');
      setActionType('income');
    } else if (type === 'bills') {
      setActionPlaceHolder('Enter your bills');
      setActionType('bills');
    } else {
      setActionPlaceHolder('Enter your budget');
      setActionType('budget');
    }
    bottomSheetModalRef.current?.present();
  };

  const handleAddFinance = async () => {
    try {
      console.log(actionType);
      await api.post('/api/expense/finance', {
        type: actionType,
        amount: actionType === 'income' ? totalIncome : budget,
      });
    } catch (error) {
      console.log(error);
    }
    fetchHomeData();
  };

  const handleSubmitAction = () => {
    bottomSheetModalRef.current?.dismiss();
    handleAddFinance();
  };

  useEffect(() => {
    const getHomeData = async () => {
      fetchHomeData();
    };
    getHomeData();
  }, [fetchHomeData]);

  return (
    <View style={styles.container}>
      <Header
        title="HomeTrack"
        showNotification
        showImage
        image="https://randomuser.me/api/portraits/men/32.jpg"
      />

      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.homeContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#D946EF']}
            style={styles.linearGradient}>
            <Text style={[styles.budgetLabel, styles.whiteText]}>
              This Month's Budget
            </Text>
            <RupeeIcon
              amount={monthSummary.totalBudget}
              color="#fff"
              size={36}
              textStyle={[styles.whiteText, {fontSize: 36, fontWeight: 'bold'}]}
            />
            <View style={styles.budgetDetails}>
              <View>
                <RupeeIcon
                  amount={monthSummary.totalIncome}
                  color="#fff"
                  textStyle={styles.whiteText}
                />
                <Text style={[styles.caption, styles.whiteText]}>Income</Text>
              </View>
              <View>
                <RupeeIcon
                  amount={monthSummary.totalExpenses}
                  color="#fff"
                  textStyle={styles.whiteText}
                />
                <Text
                  style={[
                    styles.caption,
                    styles.whiteText,
                    {textAlign: 'right'},
                  ]}>
                  Expenses
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
              onPress={() => openActionModal('income')}
              label="Add Income"
              icon="wallet-outline"
            />
            <ActionButton
              onPress={() => openActionModal('bills')}
              label="Bills"
              icon="receipt-outline"
            />
            <ActionButton
              onPress={() => openActionModal('budget')}
              label="Budget"
              icon="bar-chart-outline"
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={fetchHomeData}>
                <Icon name="refresh" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentExpenses || []}
            onRefresh={fetchHomeData}
            refreshing={loading}
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Text>No expenses found.</Text>
                </View>
              )
            }
            keyExtractor={item => item.id}
            renderItem={({item}) => <ExpenseCard expense={item} />}
            contentContainerStyle={styles.paddingBottom}
          />

          {/* Monthly Overview */}
          <Text style={styles.sectionTitle}>Monthly Overview</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {weekChartData.map((day: any, i: number) => (
                <View key={i} style={styles.chartBarItem}>
                  <View style={[styles.bar, {height: day.height}]} />
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
              ))}
            </View>

            {categoryChartData.map((item: any, i) => (
              <View key={i} style={styles.progressItem}>
                <View style={styles.progressLabel}>
                  {item.icon}
                  <Text style={styles.progressText}>{item.label}</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {width: `${item.percentage}%`},
                    ]}
                  />
                </View>
                <View style={styles.progressContainer}>
                  <RupeeIcon
                    amount={item.amount}
                    color="green"
                    size={14}
                    textStyle={styles.progressText}
                  />
                  <Text style={styles.progressPercent}>{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <KeyboardAvoidingView
          enabled
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
          }}>
          <Modal
            bottomSheetRef={bottomSheetModalRef}
            modalSnapPoints={['35%']}
            variant="scrollableModal"
            headerTitle={`Add ${actionType}`}
            onCrossPress={() => bottomSheetModalRef.current?.dismiss()}>
            <View style={styles.paddingTop}>
              <Input
                value={
                  actionType === 'budget'
                    ? budget.toString()
                    : totalIncome.toString()
                }
                onChangeText={
                  actionType === 'budget' ? onBudgetChange : onTotalIncomeChange
                }
                variant="modal"
                placeholder={actionPlaceHolder}
                placeholderTextColor="gray"
              />
              <TouchableOpacity
                onPress={handleSubmitAction}
                style={styles.saveBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const ActionButton = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Icon name={icon} size={32} color={COLORS.primaryText} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },

  homeContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  budgetCard: {
    backgroundColor: '#f7f8fa',
  },
  budgetLabel: {
    color: '#777',
    fontSize: 14,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 6,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  income: {
    color: 'green',
    fontSize: 16,
  },
  expense: {
    color: 'red',
    fontSize: 16,
  },
  caption: {
    color: '#888',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '30%',
    backgroundColor: COLORS.bgGhostWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgGhostWhite,
  },
  actionLabel: {
    fontSize: 16,
    color: COLORS.primaryText,
    fontWeight: '400',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAll: {
    color: COLORS.primaryText,
    fontSize: 16,
  },
  chartContainer: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartBarItem: {
    alignItems: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: '#4B7BFF',
    borderRadius: 6,
    marginBottom: 6,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressItem: {
    marginVertical: 6,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4B7BFF',
  },
  progressPercent: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#3366FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linearGradient: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 14,
    padding: 16,
    marginVertical: 20,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  whiteText: {
    color: '#fff',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0,
    shadowRadius: 2,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paddingBottom: {
    paddingBottom: 16,
  },
  paddingTop: {
    paddingTop: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default Home;
