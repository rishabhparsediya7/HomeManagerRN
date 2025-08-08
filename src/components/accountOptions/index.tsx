import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Accordion from '../../components/accordion';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useTheme } from '../../providers/ThemeContext';
import { commonStyles } from '../../utils/styles';

interface AccountOptionProps {
  icon: string;
  label: string;
  onPress?: (T: any) => void;
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
        onOptionPress={(option) => onPress?.(option)}
      />
    </View>
  );
};



export default AccountOption;
