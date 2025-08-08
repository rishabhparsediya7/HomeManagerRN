import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Modal } from '../../components/modal';
import RupeeIcon from '../../components/rupeeIcon';
import { category } from '../../constants';
import { useAuth } from '../../providers/AuthProvider';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useTheme } from '../../providers/ThemeContext';
import api from '../../services/api';
import { getMonthStartAndEndDates } from '../../utils/dates';
import { commonStyles } from '../../utils/styles';

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

  const maxAmount = Math.max(
    ...rawExpenseData.map(item => parseFloat(item.totalamount) || 0),
    1,
  );

  const MAX_BAR_HEIGHT = 100;

  return rawExpenseData.map((item, index) => {
    const amount = parseFloat(item.totalamount) || 0;
    const height = Math.max(10, (amount / maxAmount) * MAX_BAR_HEIGHT);

    return {
      label: weekLabels[index],
      height: height,
      amount: amount,
    };
  });
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
  const { startDate, endDate } = getMonthStartAndEndDates();
  const [recentExpenses, setRecentExpenses] = useState<ExpenseDataProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [actionPlaceHolder, setActionPlaceHolder] = useState('');
  const [actionType, setActionType] = useState<'income' | 'bills' | 'budget'>();
  const [weekChartData, setWeekChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const { theme } = useTheme();
  const {user} = useAuth();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
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

  const bannerGradient = useMemo(() => theme === 'dark' ? [colors.tabBarBackground, colors.primary] : [colors.primary, colors.buttonTextSecondary], [theme]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
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
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    budgetCard: {
      backgroundColor: colors.background,
    },
    budgetLabel: {
      // color: colors.buttonText,
      fontSize: 14,
      ...commonStyles.textDefault,
    },
    budgetAmount: {
      fontSize: 28,
      ...commonStyles.textDefault,
      color: colors.buttonText,
      marginVertical: 6,
    },
    budgetDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    income: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
      fontSize: 16,
    },
    expense: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
      fontSize: 16,
    },
    caption: {
      color: colors.buttonText,
      fontSize: 12,
      ...commonStyles.textDefault,
    },
    actions: {
      width: '100%',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    actionButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 16,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    seeAll: {
      color: colors.buttonText,
      fontSize: 16,
      ...commonStyles.textDefault,
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
      height: 120, // Fixed height for the chart container
    },
    chartBarContainer: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
    },
    chartBarItem: {
      width: 30,
      height: '100%',
      justifyContent: 'flex-end',
    },
    bar: {
      width: 20,
      backgroundColor: colors.primary,
      borderRadius: 6,
      marginBottom: 6,
    },
    dayLabel: {
      fontSize: 12,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    progressItem: {
      marginVertical: 6,
      gap: 6,
    },
    progressLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    progressText: {
      fontSize: 14,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: colors.inputBackground,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      backgroundColor: colors.buttonText,
    },
    progressPercent: {
      fontSize: 12,
      ...commonStyles.textDefault,
      color: colors.buttonText,
      textAlign: 'right',
      marginTop: 2,
    },
    saveBtn: {
      backgroundColor: colors.buttonText,
      borderRadius: 12,
      paddingVertical: 16,
      marginHorizontal: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    saveText: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
      fontSize: 16,
    },
    linearGradient: {
      flex: 1,
      alignItems: 'flex-start',
      paddingLeft: 20,
      paddingRight: 20,
      borderRadius: 14,
      padding: 16,
      marginVertical: 20,
      gap: 10,
    },
    buttonText: {
      fontSize: 18,
      textAlign: 'center',
      margin: 10,
      ...commonStyles.textDefault,
      color: colors.buttonText,
      backgroundColor: 'transparent',
    },
    whiteText: {
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    shadow: {
      shadowColor: colors.shadowColor,
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
  }), [theme]);

  return (
    <View style={styles.container}>
      <Header title="Trakio" showNotification showImage image={user?.photoUrl} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.homeContainer}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={bannerGradient}
            style={styles.linearGradient}>
            <Text style={[styles.budgetLabel, styles.whiteText]}>
              This Month's Budget
            </Text>
            <RupeeIcon
              amount={monthSummary.totalBudget}
              color={colors.buttonText}
              size={36}
              textStyle={[styles.whiteText, { fontSize: 36, fontWeight: 'bold' }]}
            />
            <View style={styles.budgetDetails}>
              <View>
                <RupeeIcon
                  amount={monthSummary.totalIncome}
                  color={colors.buttonText}
                  textStyle={styles.whiteText}
                />
                <Text style={[styles.caption, styles.whiteText]}>Income</Text>
              </View>
              <View>
                <RupeeIcon
                  amount={monthSummary.totalExpenses}
                  color={colors.buttonText}
                  textStyle={styles.whiteText}
                />
                <Text
                  style={[
                    styles.caption,
                    styles.whiteText,
                    { textAlign: 'right' },
                  ]}>
                  Expenses
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.actions}>
            <View style={styles.actionButtonContainer}>
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
            </View>
            <View style={styles.actionButtonContainer}>
              <ActionButton
                onPress={() => openActionModal('budget')}
                label="Budget"
                icon="bar-chart-outline"
              />
              <ActionButton
                onPress={() => openActionModal('budget')}
                label="Budget"
                icon="bar-chart-outline"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={fetchHomeData}>
                <Icon name="refresh" size={20} color={colors.buttonText} />
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
                  <ActivityIndicator size="large" color={colors.buttonText} />
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Text>No expenses found.</Text>
                </View>
              )
            }
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ExpenseCard expense={item} />}
            contentContainerStyle={styles.paddingBottom}
          />

          {/* Monthly Overview */}
          <Text style={styles.sectionTitle}>Monthly Overview</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {weekChartData.map((day: any, i: number) => (
                <View key={i} style={styles.chartBarContainer}>
                  <View style={styles.chartBarItem}>
                    <LinearGradient
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      colors={[colors.primary, colors.primaryLight]}
                      style={[styles.bar, { height: day.height }]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginVertical: 12 }]}>
              Category Overview
            </Text>
            {categoryChartData.map((item: any, i) => (
              <View key={i} style={styles.progressItem}>
                <View style={styles.progressLabel}>
                  {item.icon}
                  <Text style={styles.progressText}>{item.label}</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    colors={[colors.primary, colors.primaryLight]}
                    style={[
                      styles.progressBarFill,
                      { width: `${item.percentage}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressContainer}>
                  <RupeeIcon
                    amount={item.amount}
                    color={colors.buttonText}
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
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => StyleSheet.create({
    actionButton: {
      flex:1,
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      width: '50%',
    },
    actionLabel: {
      fontSize: 16,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
  }), [theme]);
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Icon name={icon} size={32} color={colors.buttonText} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};



export default Home;
