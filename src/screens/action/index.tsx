import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import Input from '../../components/form/input';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import api from '../../services/api';
import {MonthYearPicker} from '../../components/MonthYearPicker';
import Header from '../../components/Header';

const ActionScreen = ({route, navigation}) => {
  const actionType = route.params?.type;
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [budget, setBudget] = useState('');
  const [totalIncome, setTotalIncome] = useState('');
  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const onBudgetChange = (text: string) => {
    setBudget(text);
  };

  const onTotalIncomeChange = (text: string) => {
    setTotalIncome(text);
  };

  const handleBackPress = () => {
    if (navigation?.canGoBack()) navigation?.goBack();
  };
  const styles = useMemo(
    () =>
      StyleSheet.create({
        saveBtn: {
          marginTop: 20,
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        },
        saveText: {
          color: 'white',
          fontWeight: '600',
          fontSize: 16,
        },
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        label: {
          fontSize: 16,
          color: colors.buttonText,
          marginBottom: 8,
        },
      }),
    [theme],
  );

  const handleSubmitAction = async () => {
    try {
      await handleAddFinance();
      setTotalIncome('');
      setBudget('');
    } catch (error) {
      console.error('Error submitting action:', error);
    }
  };
  
  const handleAddFinance = async () => {
    if (!actionType) return;
    try {
      await api.post('/api/expense/finance', {
        type: actionType,
        amount: actionType === 'income' ? totalIncome : budget,
      });
    } catch (error) {
      console.error('Error adding finance:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Header
        title={`${actionType === 'budget' ? 'Add Budget' : 'Add Income'}`}
        headerTitleStyle={{fontSize: 28}}
        showBackButton
        showImage={false}
        onBackPress={handleBackPress}
      />
      <View style={{padding: 20}}>
        <Text style={styles.label}>
          Enter {actionType === 'budget' ? 'Budget' : 'Income'}{' '}
        </Text>
        <TextInput
          value={actionType === 'budget' ? budget || '' : totalIncome || ''}
          onChangeText={
            actionType === 'budget' ? onBudgetChange : onTotalIncomeChange
          }
          placeholder={
            actionType === 'budget'
              ? 'Enter budget amount'
              : 'Enter income amount'
          }
          placeholderTextColor={colors.buttonText}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.inputBackground,
            borderRadius: 14,
            padding: 12,
            color: colors.buttonText,
          }}
        />
        <View style={{marginTop: 20}}>
          <Text style={styles.label}>Select Date</Text>
          <MonthYearPicker
            date={currentDate}
            onDateChange={setCurrentDate}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 14,
            }}
            textStyle={{
              color: colors.buttonText,
              fontSize: 16,
            }}
            selectedTextStyle={{
              color: colors.buttonText,
              fontSize: 20,
              fontWeight: 'bold',
            }}
            highlightColor={colors.buttonText}
          />
        </View>
        <TouchableOpacity
          onPress={handleSubmitAction}
          style={[styles.saveBtn, {backgroundColor: colors.primary}]}
          activeOpacity={0.8}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActionScreen;

const styles = StyleSheet.create({});
