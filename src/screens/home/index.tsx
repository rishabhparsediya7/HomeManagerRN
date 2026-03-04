import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppGradient from '../../components/common/AppGradient';
import AppText from '../../components/common/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import ExpenseCard from '../../components/expenseCard';
import Header from '../../components/Header';
import Icons from '../../components/icons';
import RupeeIcon from '../../components/rupeeIcon';
import {category} from '../../constants';
import {useAuthorizeNavigation} from '../../navigators/navigators';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useHomeContext} from '../../providers/HomeContext';
import api from '../../services/api';
import {getMonthStartAndEndDates} from '../../utils/dates';
import {downloadAndSharePdf} from '../../utils/fileUtil';

export interface ExpenseDataProps {
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

export const mapExpenseDataToChart = (rawExpenseData: any) => {
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

export const mapCategoryExpensePercentageToChartData = (categoryData: any) => {
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

type ActionType = 'income' | 'bills' | 'budget' | null;

const Home = () => {
  const {startDate, endDate} = getMonthStartAndEndDates();
  const {
    recentExpenses,
    setRecentExpenses,
    unreadNotifications,
    setUnreadNotifications,
  } = useHomeContext();
  const [loading, setLoading] = useState(false);
  const [weekChartData, setWeekChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useAuthorizeNavigation();

  const colors = theme === 'dark' ? darkTheme : lightTheme;

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
      let expenseQuery = api.get(`/api/expense/get-home-summary`);
      let categoryQuery = api.get(`/api/expense/getExpenseByCategory`);
      const [response, categoryResponse] = await Promise.all([
        expenseQuery,
        categoryQuery,
      ]);
      const data = response.data?.data?.last5Transactions;
      const categoryData = categoryResponse.data?.data || [];
      setRecentExpenses(data);
      setMonthSummary({
        totalExpenses: Number(
          response.data?.data?.financeSummary?.amountSpent || 0,
        ),
        totalIncome: Number(
          response.data?.data?.financeSummary?.totalIncome || 0,
        ),
        totalBudget: Number(response.data?.data?.financeSummary?.budget || 0),
      });
      const updatedCategoryData =
        mapCategoryExpensePercentageToChartData(categoryData);

      setCategoryChartData(updatedCategoryData);

      const notificationResponse = await api.get('/api/notifications/me');
      setUnreadNotifications(notificationResponse.data.unreadCount || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate, limit]);

  const openActionScreen = (type: ActionType) => {
    if (!type) return;
    navigation.navigate('Action', {type});
  };

  const handleGenerateAndSaveReport = () => {
    // This URL would come from your backend API call
    const backendPdfUrl =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const fileName = `Your-Custom-Report-${Date.now()}.pdf`;

    downloadAndSharePdf(backendPdfUrl, fileName);
  };

  useEffect(() => {
    const getHomeData = async () => {
      fetchHomeData();
    };
    getHomeData();
  }, [fetchHomeData]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
    },
    homeContainer: {
      paddingHorizontal: 12,
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
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    budgetDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    actions: {
      width: '100%',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 10,
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
    chartContainer: {
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
    innerGradient: {
      flex: 1,
      alignItems: 'flex-start',
      borderRadius: 24,
      marginVertical: 6,
      padding: 16,
      gap: 8,
      overflow: 'hidden',
    },
    linearGradient: {
      flex: 1,
      alignItems: 'flex-start',
      borderRadius: 24,
      marginVertical: 6,
      marginBottom: 12,
      gap: 4,
      overflow: 'hidden',
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
    keyboardAvoidingView: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        title="Trakio"
        showDrawerButton
        onDrawerPress={() => (navigation as any).openDrawer?.()}
        showNotification
        notificationCount={unreadNotifications}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showImage
        image={user?.photoUrl}
      />

      <ScrollView
        contentContainerStyle={{paddingBottom: 12}}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.homeContainer}>
          <AppGradient style={styles.linearGradient}>
            <View style={styles.innerGradient}>
              <AppText
                variant="h6"
                weight="medium"
                color={colors.buttonTextPrimary}>
                {"This Month's Budget"}
              </AppText>
              <RupeeIcon
                amount={Number(user?.budget || monthSummary.totalBudget)}
                color={colors.buttonTextPrimary}
                size={28}
                textStyle={{fontSize: 28, fontWeight: '700'}}
              />
              <View style={styles.budgetDetails}>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}>
                  <RupeeIcon
                    amount={Number(user?.income || monthSummary.totalIncome)}
                    color={colors.buttonTextPrimary}
                    size={18}
                    textStyle={{fontSize: 18, fontWeight: '600'}}
                  />
                  <AppText
                    variant="sm"
                    weight="medium"
                    color={colors.buttonTextPrimary}>
                    Income
                  </AppText>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}>
                  <RupeeIcon
                    amount={Number(monthSummary.totalExpenses)}
                    color={colors.buttonTextPrimary}
                    size={18}
                    textStyle={{fontSize: 18, fontWeight: '600'}}
                  />
                  <AppText
                    variant="sm"
                    weight="medium"
                    color={colors.buttonTextPrimary}>
                    Expenses
                  </AppText>
                </View>
              </View>
            </View>
          </AppGradient>

          {/* <Text>Generate your report and save it to your device.</Text>
          <Button
            title="Generate & Save Report"
            onPress={handleGenerateAndSaveReport}
          /> */}

          <View style={styles.actions}>
            <View style={styles.actionButtonContainer}>
              <ActionButton
                onPress={() => openActionScreen('income')}
                label="Add Income"
                icon="wallet-outline"
              />
              <ActionButton
                onPress={() => openActionScreen('budget')}
                label="Budget"
                icon="bar-chart-outline"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <AppText variant="h6" weight="bold">
                Recent Transactions
              </AppText>
              <TouchableOpacity onPress={fetchHomeData}>
                <Icon name="refresh" size={18} color={colors.mutedText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <AppText variant="lg" weight="medium" color={colors.primary}>
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.paddingBottom}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.buttonText} />
              </View>
            ) : recentExpenses.length === 0 ? (
              <View style={styles.loadingContainer}>
                <AppText>No expenses found.</AppText>
              </View>
            ) : (
              recentExpenses.map((item, index) => (
                <ExpenseCard expense={item} key={index} />
              ))
            )}
          </View>

          {/* Category Overview */}
          <View style={styles.chartContainer}>
            <AppText variant="h6" weight="bold" style={{marginVertical: 12}}>
              Category Overview
            </AppText>
            {categoryChartData.map((item: any, i) => (
              <View key={i} style={styles.progressItem}>
                <View style={styles.progressLabel}>
                  {item.icon}
                  <AppText variant="lg" weight="medium">
                    {item.label}
                  </AppText>
                </View>
                <View style={styles.progressBarBackground}>
                  <AppGradient
                    start={{x: 0, y: 1}}
                    end={{x: 0, y: 0}}
                    colors={[colors.primary, colors.primaryLight]}
                    style={[
                      styles.progressBarFill,
                      {width: `${item.percentage}%`},
                    ]}
                  />
                </View>
                <View style={styles.progressContainer}>
                  <RupeeIcon
                    amount={item.amount}
                    color={colors.buttonText}
                    size={12}
                    textStyle={{fontSize: 12, fontWeight: '600'}}
                  />
                  <AppText
                    variant="sm"
                    weight="medium"
                    color={colors.mutedText}>
                    {item.percentage}%
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>
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
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        actionButton: {
          flex: 1,
          alignItems: 'center',
          padding: 16,
          backgroundColor: colors.cardBackground,
          borderRadius: 14,
          width: '50%',
          gap: 6,
        },
      }),
    [colors],
  );
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Icon name={icon} size={28} color={colors.primary} />
      <AppText variant="lg" weight="medium">
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

export default Home;
