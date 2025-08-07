import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { commonStyles } from '../../utils/styles';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
}

const PaymentMethodSelector = ({
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  colors,
}) => {
  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 6,
    },
    categoryItem: {
      width: '32%',
      backgroundColor: colors.inputBackground,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryLabel: {
      marginTop: 8,
      textAlign: 'center',
      fontSize: 12,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    selectedCategoryItem: {
      borderColor: colors.buttonText,
      borderWidth: 1,
    },
  });
  return (
    <View style={styles.grid}>
      {paymentMethods.map((method, idx) => {
        const isSelected = selectedPaymentMethod === method.id;

        return (
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod(method.id)}
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



export default PaymentMethodSelector;
