import {StyleSheet, TextInput} from 'react-native';
import {View} from 'react-native';
import {memo} from 'react';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
interface InputProps {
  placeholder: string;
  placeholderTextColor: string;
  style?: any;
  ref?: any;
  variant?: 'default' | 'modal';
  value?: string;
  onChangeText?: (text: string) => void;
}
const Input = ({
  ref,
  placeholder,
  placeholderTextColor = 'gray',
  style,
  variant = 'default',
  value,
  onChangeText,
  ...rest
}: InputProps) => {
  const styles = StyleSheet.create({
    container: {
      borderColor: 'gray',
      paddingBottom: 12,
      paddingHorizontal: 12,
      width: '100%',
    },
    textContainer: {
      flex: 1,
      width: '100%',
      color: 'black',
      borderColor: 'gray',
      backgroundColor: '#f1f1f1',
      padding: 16,
      height: 56,
      // minHeight: 56,
      borderRadius: 10,
      fontSize: 16,
    },
  });

  switch (variant) {
    case 'modal':
      return (
        <View style={styles.container}>
          <BottomSheetTextInput
            ref={ref}
            placeholderTextColor={placeholderTextColor}
            returnKeyType="done"
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value}
            style={[styles.textContainer, style]}
            {...rest}
          />
        </View>
      );
    default:
      return (
        <View style={styles.container}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            style={[styles.textContainer, style]}
            value={value}
            onChangeText={onChangeText}
            {...rest}
          />
        </View>
      );
  }
};

export default memo(Input);
