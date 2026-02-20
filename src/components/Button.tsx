import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import {lightTheme} from '../providers/Theme';
import {commonStyles} from '../utils/styles';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  icon?: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost'; // For future expandability
}

const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  style,
  textStyle,
  disabled,
  icon,
  children,
  variant = 'primary',
  ...rest
}) => {
  const colors = lightTheme;

  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const getContainerStyle = () => {
    if (isOutline) return styles.outlineButton;
    if (isGhost) return styles.ghostButton;
    return styles.primaryButton;
  };

  const getTextStyle = () => {
    if (isOutline) return styles.outlineText;
    if (isGhost) return styles.ghostText;
    return styles.primaryText;
  };

  const getIndicatorColor = () => {
    if (isOutline || isGhost) return colors.primary;
    return colors.buttonTextSecondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={getIndicatorColor()} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: lightTheme.buttonPrimaryBackground,
  },
  primaryText: {
    color: lightTheme.buttonTextPrimary,
    ...commonStyles.textMedium,
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  outlineText: {
    color: lightTheme.text,
    ...commonStyles.textMedium,
    fontSize: 16,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: lightTheme.primary,
    ...commonStyles.textMedium,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
