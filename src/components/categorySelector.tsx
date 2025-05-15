import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: any;
}

const CategorySelector = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) => {
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

export default CategorySelector;
