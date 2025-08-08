// components/CustomTabBar.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabButton from './TabButton';
import { useMemo } from 'react';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const focusedIndex = state.index;
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = useMemo(() => StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      height: 84,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 10,
        },
      }),
    }
  }), [theme]);

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
            maxIndex={state.routes.length - 1}
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



export default CustomTabBar;