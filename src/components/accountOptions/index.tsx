// components/AccountOption.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useMemo } from 'react';
import { commonStyles } from '../../utils/styles';
import Accordion from '../../components/accordion';
interface AccountOptionProps {
  icon: string;
  label: string;
  onPress?: () => void;
  options?: string[];
}

const AccountOption = ({ icon, label, onPress, options }: AccountOptionProps) => {

  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => StyleSheet.create({
    row: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
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
    <View style={styles.row}>
      <Accordion
        title={label}
        icon={icon}
        options={options || []}
        onOptionPress={onPress}
      />
    </View>
  );
};



export default AccountOption;
