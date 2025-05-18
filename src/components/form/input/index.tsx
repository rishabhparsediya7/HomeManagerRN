import {StyleSheet, TextInput} from 'react-native';
import {View} from 'react-native';
import {memo} from 'react';
interface InputProps {
  placeholder: string;
  placeholderTextColor: string;
  style?: any;
}
const Input = ({
  placeholder,
  placeholderTextColor = 'gray',
  style,
  ...rest
}: InputProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        style={[styles.textContainer, style]}
        {...rest}
      />
    </View>
  );
};

export default memo(Input);
const styles = StyleSheet.create({
  container: {
    borderColor: 'gray',
    padding: 12,
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
    minHeight: 56,
    borderRadius: 10,
    fontSize: 16,
  },
});
