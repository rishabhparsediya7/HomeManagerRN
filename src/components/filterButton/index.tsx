import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const FilterButton = ({label, selected, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.selectedButton]}
      onPress={onPress}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  selectedButton: {
    backgroundColor: '#3B82F6',
  },
  label: {
    color: '#111827',
  },
  selectedLabel: {
    color: 'white',
    fontWeight: '600',
  },
});

export default FilterButton;
