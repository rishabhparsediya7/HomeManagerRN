// components/AccountOption.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useMemo } from 'react';
import { commonStyles } from '../../utils/styles';
interface AccountOptionProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

const AccountOption = ({ icon, label, onPress }: AccountOptionProps) => {

  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 20,
    },
    iconContainer: {
      width: 30,
    },
    label: {
      flex: 1,
      fontSize: 16,
      marginLeft: 10,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    arrow: {
      alignSelf: 'center',
    },
  }), [theme]);
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={colors.buttonText} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Feather
        name="chevron-right"
        size={20}
        color={colors.buttonText}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};



export default AccountOption;
