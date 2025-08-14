import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import LinearGradient from 'react-native-linear-gradient';

const Tabs = ({handleExpensesPress, handleFinancialSummaryPress}: {handleExpensesPress: () => void, handleFinancialSummaryPress: () => void}) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
      maxHeight: 60,
    },
    content: {  
      flex: 1,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    button: {
      flex: 1,
      width: '100%',
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    divider: {
      width: 1,
    },
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleExpensesPress}>
          <Text style={styles.buttonText}>Expenses</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={[colors.inputText, colors.inputBackground]}
          style={styles.divider}
        />
        <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleFinancialSummaryPress}>
          <Text style={styles.buttonText}>Financial Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Tabs;
