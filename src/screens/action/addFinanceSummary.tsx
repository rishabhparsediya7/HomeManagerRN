import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';
import { MonthYearPicker } from '../../components/MonthYearPicker';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useTheme } from '../../providers/ThemeContext';
import api from '../../services/api';
import { useAuth } from '../../providers/AuthProvider';

type ActionType = 'income' | 'budget' | 'bills' | null;

const ActionScreen = ({route, navigation}) => {
  const actionType: ActionType = route.params?.type;
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [budget, setBudget] = useState('');
  const [totalIncome, setTotalIncome] = useState('');
  const [loading, setLoading]=useState(false);
  const {user, setUser}=useAuth()

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

  const handleAddBudget = async () => {
    if (!actionType) return;
    try {
      setLoading(true)
      await api.post('/api/expense/add-budget', {
        amount: budget,
        month: currentDate.month,
        year: currentDate.year,
      });
      if(currentDate.month === new Date().getMonth() + 1 && currentDate.year === new Date().getFullYear()){
        setUser({
          ...user,
          budget: Number(budget),
        })
      }
    } catch (error) {
      console.error('Error adding finance:', error);
    }
    finally{
      setLoading(false)
    }
  };

  const handleIncome = async()=>{
    if (!actionType) return;
    try {
      setLoading(true)
      await api.post('/api/expense/add-income', {
        amount: totalIncome,
        month: currentDate.month,
        year: currentDate.year,
      });
      if(currentDate.month === new Date().getMonth() + 1 && currentDate.year === new Date().getFullYear()){
        setUser({
          ...user,
          income: Number(totalIncome),
        })
      }

    } catch (error) {
      console.error('Error adding finance:', error);
    }
    finally{
      setLoading(false)
    }
  }

  const handleSubmitAction = async () => {
    try {
      if(actionType === 'budget'){
        await handleAddBudget()
      }
      else if(actionType==='income'){
        await handleIncome()
      }
      setTotalIncome('');
      setBudget('');
      navigation.canGoBack() && navigation.goBack()
    } catch (error) {
      console.error('Error submitting action:', error);
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
          <Text style={styles.saveText}>
            {loading ? <ActivityIndicator color={colors.buttonText} size="small" /> : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActionScreen;

const styles = StyleSheet.create({});
