import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import Header from '../../components/Header';
import Tabs from '../../components/tabs';
import ExpenseScreen from '../../components/tabs/expenseScreen';
import FinancialSummaryScreen from '../../components/tabs/financialSummary';
import {downloadAndSharePdf} from '../../utils/fileUtil';
import FilterButton from '../../components/filterButton';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

const filterOptions = [
  'Today',
  'Week',
  'Month',
  'Custom',
  'Year',
  'Category',
  'Payment Method',
];
type ExportDataProps = {
  navigation: any;
};

type selectedTabType = 'expenses' | 'financialSummary';

const ExportData = ({navigation}: ExportDataProps) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [selectedTab, setSelectedTab] = useState<selectedTabType>('expenses');
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(undefined);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    text: {
      fontSize: 20,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    content: {
      flex: 1,
    },
    filters: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    dataContainer: {
      flex: 1,
    },
    buttonContainer: {
      padding: 16,
    },
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: colors.inputBackground,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      borderColor: colors.buttonText,
      borderWidth: 1,
    },
    buttonText: {
      fontSize: 16,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    filterButton: {
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    filterIcon: {
      transform: [{rotate: '90deg'}],
    },
  });

  const handleExpensesPress = () => {
    console.log('Expenses Pressed');
    setSelectedTab('expenses');
  };

  const handleFinancialSummaryPress = () => {
    console.log('Financial Summary Pressed');
    setSelectedTab('financialSummary');
  };

  const handleFilterPress = () => {
    console.log('Filter Pressed');
  };

  return (
    <View style={styles.container}>
      <Header
        showBackButton
        showImage={false}
        title="Export Data"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Tabs
          handleExpensesPress={handleExpensesPress}
          handleFinancialSummaryPress={handleFinancialSummaryPress}
        />
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filters}
            contentContainerStyle={{
              paddingRight: 40,
            }}
          >
            {filterOptions.map(option => (
              <FilterButton
                key={option}
                label={option}
                selected={selectedFilter === option}
                onPress={() => setSelectedFilter(option)}
                colors={colors}
              />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="equalizer" style={styles.filterIcon} size={22} color={colors.inputText} />
          </TouchableOpacity>
        </View>
        <View style={styles.dataContainer}>
          {selectedTab === 'expenses' && <ExpenseScreen filter={selectedFilter} categoryId={categoryId} paymentMethodId={paymentMethodId} />}
          {selectedTab === 'financialSummary' && <FinancialSummaryScreen />}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              downloadAndSharePdf(
                'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'dummy.pdf',
              )
            }>
            <Text style={styles.buttonText}>Export or Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ExportData;
