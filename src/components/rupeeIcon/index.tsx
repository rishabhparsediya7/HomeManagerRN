import Icon from 'react-native-vector-icons/FontAwesome';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {getReadableAmount} from '../../utils/amounts';

interface RupeeIconProps {
  amount: number;
  size?: number;
  color?: string;
  textStyle?: TextStyle | TextStyle[];
}
export default function RupeeIcon({
  amount,
  size = 24,
  color = '#4F46E5',
  textStyle,
}: RupeeIconProps) {
  return (
    <View style={styles.container}>
      <Icon name="rupee" style={styles.icon} size={size} color={color} />
      <Text style={[styles.text, textStyle]}>{getReadableAmount(amount)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    textAlignVertical: 'auto',
    fontSize: 24,
    textAlign: 'center',
  },
});
