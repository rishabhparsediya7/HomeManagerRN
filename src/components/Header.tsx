import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../providers/AuthProvider';

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
}) => {
  const {user} = useAuth();
  const {photoUrl} = user;
  return (
    <View style={[styles.container, headerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <View style={styles.titleBackButtonContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      </View>

      <View style={styles.iconContainer}>
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress}>
            <Icon name="notifications" size={24} color="#000" />
          </TouchableOpacity>
        )}
        {showImage && (
          <Image source={{uri: photoUrl || image}} style={styles.image} />
        )}
        {showCrossButton && (
          <TouchableOpacity onPress={onCrossPress}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 64,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
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
});

export default Header;
