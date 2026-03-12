import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppGradient from '@atoms/AppGradient';
import AppText from '@atoms/AppText';
import DonutChart from '@organisms/DonutChart';
import ExpenseCard from '@organisms/expenseCard';
import Header from '@organisms/Header';
import RupeeIcon from '@atoms/rupeeIcon';
import {category} from '../../constants';
import {useAuthorizeNavigation} from '../../navigators/navigators';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import api from '../../services/api';
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

const CATEGORY_COLORS = [
  '#007AFF', // Blue
  '#FF9500', // Orange
  '#34C759', // Green
  '#AF52DE', // Purple
  '#FF3B30', // Red
  '#5AC8FA', // Teal
  '#FFCC00', // Yellow
  '#FF2D55', // Pink
];

type ActionType = 'income' | 'bills' | 'budget' | null;

import {useHomeStore} from '../../store';

const Home = () => {
  const {
    recentExpenses,
    unreadNotifications,
    financeSummary,
    categoryChartData,
    setCategoryChartData,
    fetchHomeData,
    isLoading: loading,
    _hasHydrated,
  } = useHomeStore();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useAuthorizeNavigation();

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const onManualRefresh = useCallback(() => {
    fetchHomeData(true);
  }, [fetchHomeData]);

  useEffect(() => {
    // Only fetch once rehydrated from storage
    if (_hasHydrated) {
      fetchHomeData();
    }
  }, [_hasHydrated, fetchHomeData]);

  useEffect(() => {
    // Sync category chart data whenever recent expenses change
    if (!_hasHydrated) return;

    const syncCategoryData = async () => {
      try {
        const categoryResponse = await api.get(
          `/api/expense/getExpenseByCategory`,
        );
        const categoryData = categoryResponse.data?.data || [];
        const updatedCategoryData =
          mapCategoryExpensePercentageToChartData(categoryData);
        setCategoryChartData(updatedCategoryData);
      } catch (error) {
        console.error('Error syncing category data:', error);
      }
    };

    syncCategoryData();
  }, [_hasHydrated, recentExpenses, setCategoryChartData]);

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
    categorySection: {
      paddingBottom: 16,
    },
    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 12,
      gap: 12,
      width: '100%',
    },
    legendContainer: {
      flex: 1,
      gap: 6,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendTextGroup: {
      flex: 1,
    },
    innerGradient: {
      flex: 1,
      alignItems: 'flex-start',
      borderRadius: 24,
      marginVertical: 6,
      padding: 16,
      gap: 2,
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
              <RupeeIcon
                amount={Number(user?.budget || financeSummary.totalBudget)}
                color={colors.buttonTextPrimary}
                size={28}
                textStyle={{fontSize: 28, fontWeight: '700'}}
              />
              <AppText
                variant="md"
                weight="medium"
                color={colors.buttonTextPrimary}
                style={{marginBottom: 12}}>
                {"This Month's Budget"}
              </AppText>
              <View style={styles.budgetDetails}>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}>
                  <RupeeIcon
                    amount={Number(user?.income || financeSummary.totalIncome)}
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
                    amount={Number(financeSummary.totalExpenses)}
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
              <TouchableOpacity onPress={onManualRefresh}>
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
          {categoryChartData.filter((item: any) => item.amount > 0).length >
            0 && (
            <View style={styles.categorySection}>
              <AppText variant="h6" weight="bold" style={{marginBottom: 4}}>
                Category Overview
              </AppText>

              <View style={styles.donutRow}>
                <DonutChart
                  size={220}
                  strokeWidth={20}
                  backgroundColor={colors.borderLight}
                  selectedIndex={selectedCategory}
                  onSegmentPress={index =>
                    setSelectedCategory(prev => (prev === index ? null : index))
                  }
                  segments={categoryChartData
                    .filter((item: any) => item.amount > 0)
                    .map((item: any, i: number) => ({
                      percentage: item.percentage,
                      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    }))}>
                  <View style={{alignItems: 'center'}}>
                    {selectedCategory !== null ? (
                      <>
                        <RupeeIcon
                          amount={
                            categoryChartData.filter(
                              (item: any) => item.amount > 0,
                            )[selectedCategory]?.amount || 0
                          }
                          color={
                            CATEGORY_COLORS[
                              selectedCategory % CATEGORY_COLORS.length
                            ]
                          }
                          size={14}
                          textStyle={{fontSize: 14, fontWeight: '700'}}
                        />
                        <AppText
                          variant="caption"
                          weight="medium"
                          color={colors.mutedText}
                          numberOfLines={1}>
                          {categoryChartData.filter(
                            (item: any) => item.amount > 0,
                          )[selectedCategory]?.label || ''}
                        </AppText>
                        <AppText
                          variant="caption"
                          weight="semiBold"
                          color={
                            CATEGORY_COLORS[
                              selectedCategory % CATEGORY_COLORS.length
                            ]
                          }>
                          {categoryChartData.filter(
                            (item: any) => item.amount > 0,
                          )[selectedCategory]?.percentage || 0}
                          %
                        </AppText>
                      </>
                    ) : (
                      <>
                        <RupeeIcon
                          amount={financeSummary.totalExpenses}
                          color={colors.buttonText}
                          size={13}
                          textStyle={{fontSize: 13, fontWeight: '700'}}
                        />
                        <AppText
                          variant="caption"
                          weight="medium"
                          color={colors.mutedText}>
                          Spent
                        </AppText>
                      </>
                    )}
                  </View>
                </DonutChart>

                <View style={styles.legendContainer}>
                  {categoryChartData
                    .filter((item: any) => item.amount > 0)
                    .map((item: any, i: number) => (
                      <View key={i} style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            {
                              backgroundColor:
                                CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                            },
                          ]}
                        />
                        <View style={styles.legendTextGroup}>
                          <AppText
                            variant="md"
                            weight="medium"
                            numberOfLines={1}>
                            {item.label}
                          </AppText>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          )}
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
