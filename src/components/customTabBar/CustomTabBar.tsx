// components/CustomTabBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabButton from './TabButton';

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const focusedIndex = state.index;

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = focusedIndex === index;
        const isLeftOfFocused = focusedIndex > index;
        const isRightOfFocused = focusedIndex < index;

        return (
          <TabButton
            key={route.key}
            index={index}
            focusedIndex={focusedIndex}
            routeName={route.name}
            isFocused={isFocused}
            isLeftOfFocused={isLeftOfFocused}
            isRightOfFocused={isRightOfFocused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default CustomTabBar;