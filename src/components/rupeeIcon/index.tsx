import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { getReadableAmount } from '../../utils/amounts';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { commonStyles } from '../../utils/styles';
import { useMemo } from 'react';

interface RupeeIconProps {
  amount: number;
  size?: number;
  color?: string;
  textStyle?: TextStyle | TextStyle[];
}
export default function RupeeIcon({
  amount,
  size = 16,
  color = '#32D74B',
  textStyle,
}: RupeeIconProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => StyleSheet.create({
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
      fontSize: size,
      textAlign: 'center',
      ...commonStyles.textDefault,
      color: color,
    },
  }), [theme]);
  return (
    <View style={styles.container}>
      <Icon name="rupee" style={styles.icon} size={size} color={color} />
      <Text style={[styles.text, textStyle]}>{getReadableAmount(amount)}</Text>
    </View>
  );
}
