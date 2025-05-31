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
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import {categories as homeCategories} from '../../types/categories';
import {Modal} from '../../components/modal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import Input from '../../components/form/input';
import LinearGradient from 'react-native-linear-gradient';
import RupeeIcon from '../../components/rupeeIcon';
import api from '../../services/api';
import {getMonthStartAndEndDates} from '../../utils/dates';
import ExpenseCard from '../../components/expenseCard';

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

const Home = () => {
  const categories = useMemo(() => homeCategories, []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {startDate, endDate} = getMonthStartAndEndDates();
  const [recentExpenses, setRecentExpenses] = useState<ExpenseDataProps[]>([]);
  const [loading, setLoading] = useState(false);
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

  console.log('Start Date:', startDate); // e.g., 2025-05-01
  console.log('End Date:', endDate); // e.g., 2025-05-31

  const handleAddBudget = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleAddExpense = () => {};
  const handleAddIncome = () => {};
  const handleAddBills = () => {
    bottomSheetModalRef.current?.dismiss();
  };
  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/expense?filter=${filter}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      );
      const data = response.data.data;
      setRecentExpenses(data);
      setMonthSummary({
        totalExpenses: Number(response.data?.totalMonthSum || 0),
        totalIncome: Number(response.data?.totalIncome || 0),
        totalBudget: Number(response.data?.totalBudget || 0),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate, limit]);

  useEffect(() => {
    const getHomeData = async () => {
      fetchHomeData();
    };
    getHomeData();
  }, [fetchHomeData]);

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 100}}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
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
          headerTitle="Add Budget"
          onCrossPress={() => bottomSheetModalRef.current?.dismiss()}>
          <View style={{paddingTop: 20}}>
            <Input
              variant="modal"
              placeholder="Enter your budget"
              placeholderTextColor="gray"
            />
            <Input
              variant="modal"
              placeholder="Enter your budget name"
              placeholderTextColor="gray"
            />
            <TouchableOpacity onPress={handleAddExpense} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
      <Header
        title="HomeTrack"
        showNotification
        showImage
        image="https://randomuser.me/api/portraits/men/32.jpg"
      />
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
            onPress={handleAddExpense}
            label="Add Expense"
            icon="add"
          />
          <ActionButton
            onPress={handleAddIncome}
            label="Add Income"
            icon="wallet-outline"
          />
          <ActionButton
            onPress={handleAddBills}
            label="Bills"
            icon="receipt-outline"
          />
          <ActionButton
            onPress={handleAddBudget}
            label="Budget"
            icon="bar-chart-outline"
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
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
        />

        {/* Monthly Overview */}
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartBars}>
            {days.map((day, i) => (
              <View key={i} style={styles.chartBarItem}>
                <View style={[styles.bar, {height: day.height}]} />
                <Text style={styles.dayLabel}>{day.label}</Text>
              </View>
            ))}
          </View>

          {progressData.map((item, i) => (
            <View key={i} style={styles.progressItem}>
              <View style={styles.progressLabel}>
                <Icon name={item.icon} size={16} color="#444" />
                <Text style={styles.progressText}>{item.label}</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[styles.progressBarFill, {width: `${item.percent}%`}]}
                />
              </View>
              <Text style={styles.progressPercent}>{item.percent}%</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  <TouchableOpacity
    style={[styles.actionButton, styles.whiteBackground]}
    onPress={onPress}>
    <Icon name={icon} size={20} color="#4B7BFF" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const days = [
  {label: 'Mon', height: 60},
  {label: 'Tue', height: 40},
  {label: 'Wed', height: 60},
  {label: 'Thu', height: 45},
  {label: 'Fri', height: 70},
  {label: 'Sat', height: 50},
  {label: 'Sun', height: 65},
];

const progressData = [
  {label: 'Shopping', percent: 35, icon: 'bag-outline'},
  {label: 'Food', percent: 25, icon: 'restaurant-outline'},
  {label: 'Transport', percent: 20, icon: 'car-outline'},
];

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
    width: 80,
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
  },
  actionLabel: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  seeAll: {
    color: '#2F80ED',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txIconContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 30,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  txDate: {
    fontSize: 12,
    color: '#888',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: 'red',
    fontSize: 14,
  },
  txCategory: {
    fontSize: 12,
    color: '#888',
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
  whiteBackground: {
    backgroundColor: '#fff',
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
});

export default Home;
