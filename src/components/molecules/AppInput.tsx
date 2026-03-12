import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import AppText, {AppTextProps} from '@atoms/AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  labelProps?: AppTextProps;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'modal' | 'phone';
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  labelProps,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  variant = 'default',
  placeholderTextColor,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const InputComponent = variant === 'modal' ? BottomSheetTextInput : TextInput;
  const finalPlaceholderColor = placeholderTextColor || colors.placeholder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <AppText
          variant="sm"
          color={colors.text}
          {...labelProps}
          style={[styles.label, labelProps?.style]}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
          },
        ]}>
        {variant === 'phone' && (
          <View
            style={[
              styles.phonePrefix,
              {
                backgroundColor: colors.surface,
                borderRightColor: colors.border,
              },
            ]}>
            <AppText weight="bold" style={styles.phonePrefixText}>
              +91
            </AppText>
          </View>
        )}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <InputComponent
          style={[styles.input, {color: colors.inputText}, inputStyle, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={finalPlaceholderColor}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <AppText
          variant="caption"
          color={colors.error}
          style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    textAlignVertical: 'center',
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  phonePrefix: {
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    marginRight: 12,
    marginLeft: -12, // Offset the paddingHorizontal of inputContainer
  },
  phonePrefixText: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AppInput;
