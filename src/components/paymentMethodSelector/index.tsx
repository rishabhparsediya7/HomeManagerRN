import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const PaymentMethodSelector = ({
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}) => {
  return (
    <View style={styles.grid}>
      {paymentMethods.map((method, idx) => {
        const isSelected = selectedPaymentMethod === method.name;

        return (
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod(method.name)}
            style={[
              styles.categoryItem,
              isSelected && styles.selectedCategoryItem,
            ]}
            key={idx}>
            {method.icon}
            <Text style={styles.categoryLabel}>{method.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  categoryItem: {
    width: '32%',
    backgroundColor: '#F5F6FA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  selectedCategoryItem: {
    borderColor: '#007BFF',
    borderWidth: 1,
  },
});

export default PaymentMethodSelector;
