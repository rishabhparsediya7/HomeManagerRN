import React from 'react';
import {StyleSheet, ViewStyle, StyleProp} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';

interface AppGradientProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: string[];
  variant?: 'primary' | 'accent';
  start?: {x: number; y: number};
  end?: {x: number; y: number};
}

const AppGradient: React.FC<AppGradientProps> = ({
  children,
  style,
  colors,
  variant = 'primary',
  start = {x: 0, y: 0},
  end = {x: 1, y: 1},
}) => {
  const {theme} = useTheme();
  const themeColors = theme === 'dark' ? darkTheme : lightTheme;

  const resolvedColors =
    colors ||
    (variant === 'accent'
      ? themeColors.gradientAccent
      : themeColors.gradientPrimary);

  return (
    <LinearGradient
      colors={resolvedColors}
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
