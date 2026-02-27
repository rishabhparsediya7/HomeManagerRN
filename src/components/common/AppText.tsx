import React from 'react';
import {StyleProp, StyleSheet, Text, TextProps, TextStyle} from 'react-native';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {fonts} from '../../utils/styles';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'lg'
  | 'md'
  | 'sm'
  | 'caption';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof fonts;
  style?: StyleProp<TextStyle>;
}

const fontWeightMapping: Record<keyof typeof fonts, TextStyle['fontWeight']> = {
  thin: '100',
  extraLight: '200',
  light: '300',
  default: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

const AppText: React.FC<AppTextProps> = ({
  variant = 'md',
  color,
  weight = 'default',
  style,
  children,
  ...props
}) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const variantStyle = styles[variant];
  const finalFontFamily = fonts[weight];
  const finalFontWeight = fontWeightMapping[weight];
  const finalColor = color || colors.text;

  return (
    <Text
      style={[
        variantStyle,
        {
          color: finalColor,
          fontFamily: finalFontFamily,
          fontWeight: finalFontWeight,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

export default AppText;

const styles = StyleSheet.create({
  h1: {
    fontSize: 36,
  },
  h2: {
    fontSize: 32,
  },
  h3: {
    fontSize: 28,
  },
  h4: {
    fontSize: 24,
  },
  h5: {
    fontSize: 20,
  },
  h6: {
    fontSize: 16,
  },
  lg: {
    fontSize: 14,
  },
  md: {
    fontSize: 12,
  },
  sm: {
    fontSize: 10,
  },
  caption: {
    fontSize: 8,
    opacity: 0.7,
  },
});
