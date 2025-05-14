// components/AccountOption.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
interface AccountOptionProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

const AccountOption = ({icon, label, onPress}: AccountOptionProps) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color="#374151" />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Feather
        name="chevron-right"
        size={20}
        color="gray"
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 30,
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  arrow: {
    alignSelf: 'center',
  },
});

export default AccountOption;
