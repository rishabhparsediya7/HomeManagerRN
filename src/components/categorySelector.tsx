import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { commonStyles } from '../utils/styles';

interface Category {
  id: string;
  name: string;
  icon: any;
}

const CategorySelector = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  colors,
}: {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  colors: any;
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
      {categories.map((category, idx) => {
        const isSelected = selectedCategory === category.id;

        return (
          <TouchableOpacity
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryItem,
              isSelected && styles.selectedCategoryItem,
            ]}
            key={idx}>
            {<category.icon />}
            <Text style={styles.categoryLabel}>{category.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};


export default CategorySelector;
