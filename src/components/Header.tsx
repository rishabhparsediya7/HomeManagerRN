import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
  Platform,
  TextStyle,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../providers/AuthProvider';
import {useTheme} from '../providers/ThemeContext';
import {darkTheme, lightTheme} from '../providers/Theme';
import { useMemo } from 'react';
import { commonStyles } from '../utils/styles';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  showImage?: boolean;
  image?: string;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  showCrossButton?: boolean;
  onCrossPress?: () => void;
  headerStyle?: StyleProp<ViewStyle>;
  headerTitleStyle?: StyleProp<TextStyle>;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showNotification = false,
  showImage = true,
  image = 'https://randomuser.me/api/portraits/men/32.jpg',
  onBackPress,
  onNotificationPress,
  showCrossButton = false,
  onCrossPress,
  headerStyle,
  headerTitleStyle,
}) => {
  const {user} = useAuth();
  const {photoUrl} = user;
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = useMemo(() => StyleSheet.create({
    titleBackButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      flexDirection: 'row',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      height: 72,
      paddingHorizontal:16,
      marginTop: StatusBar.currentHeight,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    backButton: {
      padding: 8,
    },
    titleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      ...commonStyles.textExtraBold,
      color: colors.buttonText,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
    },
    image: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
  }), [theme]);
  
  return (
    <View style={[styles.container, headerStyle]}>
      <View style={styles.titleBackButtonContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color={colors.buttonText} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          {title && <Text style={[styles.title, headerTitleStyle]}>{title}</Text>}
        </View>
      </View>

      <View style={styles.iconContainer}>
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress}>
            <Icon name="notifications" size={24} color={colors.buttonText} />
          </TouchableOpacity>
        )}
        {showImage && (
          <Image source={{uri: photoUrl || image}} style={styles.image} />
        )}
        {showCrossButton && (
          <TouchableOpacity onPress={onCrossPress}>
            <Icon name="close" size={24} color={colors.buttonText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


export default Header;
