import React, {useMemo} from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {commonStyles} from '../../utils/styles';

const FilterButton = ({label, selected, onPress, colors}: any) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 20,
          backgroundColor: colors.buttonBackground,
          borderColor: colors.primary,
          borderWidth: 1,
        },
        selectedButton: {
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 20,
          backgroundColor: colors.buttonBackground,
          borderColor: colors.primary,
          borderWidth: 1,
        },
        label: {
          color: 'white',
          ...commonStyles.textDefault,
          textTransform: 'capitalize',
        },
        selectedLabel: {
          color: 'white',
          ...commonStyles.textDefault,
        },
      }),
    [colors],
  );
  return (
    <View style={[styles.button, selected && styles.selectedButton]}>
      <TouchableOpacity onPress={onPress}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FilterButton;
