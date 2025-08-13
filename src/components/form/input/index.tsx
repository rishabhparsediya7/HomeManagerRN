import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { memo } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme } from '../../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../../providers/Theme';
import { commonStyles } from '../../../utils/styles';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'modal' | 'phone';
}

const Input = ({
  variant = 'default',
  placeholderTextColor = 'gray',
  style,
  ...rest
}: InputProps) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      paddingBottom: 12,
      width: '100%',
      flexDirection: 'row',
    },
    textContainer: {
      flex: 1,
      width: '100%',
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
      padding: 16,
      height: 56,
      borderRadius: 10,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
    phoneContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      color: colors.buttonText,
      backgroundColor: colors.inputText,
      height: 56,
      width: 52,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      zIndex: 1,
      ...commonStyles.textDefault,
    },
    phoneText: {
      position: 'absolute',
      top: 16,
      left: 10,
      color: colors.buttonTextSecondary,
      fontSize: 16,
      ...commonStyles.textExtraBold,
    },
  });

  switch (variant) {
    case 'modal':
      return (
        <View style={styles.container}>
          <BottomSheetTextInput
            placeholderTextColor={placeholderTextColor}
            returnKeyType="done"
            style={[styles.textContainer, style]}
            {...rest}
          />
        </View>
      );

    case 'phone':
      return (
        <View style={styles.container}>
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneText}>+91</Text>
          </View>
          <TextInput
            placeholderTextColor={placeholderTextColor}
            keyboardType="phone-pad"
            style={[styles.textContainer, style, {paddingLeft:68}]}
            {...rest}
          />
        </View>
      );

    default:
      return (
        <View style={styles.container}>
          <TextInput
            placeholderTextColor={placeholderTextColor}
            style={[styles.textContainer, style]}
            {...rest}
          />
        </View>
      );
  }
};

export default memo(Input);
