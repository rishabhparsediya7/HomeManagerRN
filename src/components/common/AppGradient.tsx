import React from 'react';
import {StyleSheet, ViewStyle, StyleProp} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AppGradientProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
}

const AppGradient: React.FC<AppGradientProps> = ({
  children,
  style,
  colors = ['#34D399', '#10B981', '#06B6D4', '#22C55E'],
  start = {x: 0, y: 0},
  end = {x: 1, y: 1},
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
};

export default AppGradient;

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
