import React, {useMemo} from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../providers/AuthProvider';
import {useTheme} from '../providers/ThemeContext';
import {darkTheme, lightTheme} from '../providers/Theme';
import Icons from './icons';
import {commonStyles} from '../utils/styles';
import {createInitialsForImage} from '../utils/users';
import AppText from './common/AppText';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  showImage?: boolean;
  image?: string;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  showCrossButton?: boolean;
  onCrossPress?: () => void;
  headerStyle?: StyleProp<ViewStyle>;
  headerTitleStyle?: StyleProp<TextStyle>;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  showDrawerButton?: boolean;
  onDrawerPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showNotification = false,
  showImage = true,
  image = '',
  onBackPress,
  onNotificationPress,
  notificationCount = 0,
  showCrossButton = false,
  onCrossPress,
  headerStyle,
  headerTitleStyle,
  showBack,
  rightComponent,
  showDrawerButton = false,
  onDrawerPress,
}) => {
  const {user} = useAuth();
  const {photoUrl} = user;
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          paddingHorizontal: 4,
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
        badge: {
          position: 'absolute',
          top: -2,
          right: -2,
          backgroundColor: '#FF3B30',
          borderRadius: 8,
          width: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: colors.background,
        },
        badgeText: {
          color: 'white',
          fontSize: 8,
          fontWeight: 'bold',
        },
        initialsContainer: {
          backgroundColor: colors.primary || '#4F46E5',
          justifyContent: 'center',
          alignItems: 'center',
        },
        initialsText: {
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold',
        },
      }),
    [colors.background],
  );

  return (
    <View style={[styles.container, headerStyle]}>
      <View style={styles.titleBackButtonContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color={colors.buttonText} />
          </TouchableOpacity>
        )}

        {showDrawerButton && (
          <TouchableOpacity style={styles.backButton} onPress={onDrawerPress}>
            <Icons.MenuIcon color={colors.buttonText} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          {title && (
            <AppText weight="semiBold" variant="h2">
              {title}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.iconContainer}>
        {rightComponent}
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress}>
            <Icon name="notifications" size={24} color={colors.buttonText} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showImage && (photoUrl || image) ? (
          <Image source={{uri: photoUrl || image}} style={styles.image} />
        ) : showImage ? (
          <View style={[styles.image, styles.initialsContainer]}>
            <Text style={styles.initialsText}>
              {createInitialsForImage(user?.name || '')}
            </Text>
          </View>
        ) : null}
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
