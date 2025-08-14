import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { commonStyles } from '../../utils/styles';

const FilterButton = ({ label, selected, onPress, colors }: any) => {
  const styles = useMemo(() => StyleSheet.create({
    button: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    selectedButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    label: {
      color: colors.text,
      ...commonStyles.textDefault,
      textTransform: 'capitalize',
    },
    selectedLabel: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
  }), [colors]);
  return (
    <LinearGradient
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[colors.inputBackground, selected ? colors.inputText : colors.inputBackground]}
      style={[styles.button, selected && styles.selectedButton]}
    >
      <TouchableOpacity
        onPress={onPress}
        >
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};



export default FilterButton;
