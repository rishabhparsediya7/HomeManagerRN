import Icon from 'react-native-vector-icons/FontAwesome';
import {Platform, StyleSheet, Text, TextStyle, View} from 'react-native';
import {getReadableAmount} from '../../utils/amounts';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import {useMemo} from 'react';
import AppText from '../../components/common/AppText';
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
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          // borderWidth: 1,
        },
        icon: {
          borderWidth: 1,
          borderColor: 'transparent',
          marginTop: 1,
          ...Platform.select({
            ios: {
              paddingTop: 2, // Fine-tune alignment for iOS icon fonts
            },
          }),
        },
        text: {
          textAlignVertical: 'auto',
          textAlign: 'center',
          color: color,
        },
      }),
    [theme],
  );
  return (
    <View style={styles.container}>
      <Icon name="rupee" style={styles.icon} size={size} color={color} />
      <AppText variant="h6" style={[styles.text, textStyle]}>
        {getReadableAmount(amount)}
      </AppText>
    </View>
  );
}
