// screens/Profile.js
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  ColorSchemeName,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Asset} from 'react-native-image-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AccountOption from '../../components/accountOptions';
import AppText from '../../components/common/AppText';
import ImageUploader from '../../components/imageUploader';
import {Modal} from '../../components/modal';
import RupeeIcon from '../../components/rupeeIcon';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {
  getUser as fetchUser,
  uploadProfilePicture,
} from '../../services/userService';
import {DeviceInfo, getDeviceInfo} from '../../utils/deviceInfo';
const Profile = ({navigation}: {navigation: any}) => {
  const {signOut, user, setUser} = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.photoUrl || '');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [amountSpent, setAmountSpent] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<Asset | undefined>(
    undefined,
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {theme, toggleTheme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleToggleTheme = (theme: ColorSchemeName) => {
    if (theme) {
      toggleTheme(theme.toLowerCase() as ColorSchemeName);
    }
  };

  const handleLogout = () => {
    bottomSheetModalRef.current?.present();
  };

  const accountOptionsData = [
    {
      icon: 'edit',
      label: 'Personal Information',
      onPress: () => navigation.navigate('EditPersonalInformation'),
      options: ['Edit Personal Information'],
    },
    {
      icon: 'dark-mode',
      label: 'Theme',
      onPress: () => {},
      options: ['Light'],
    },
    {
      icon: 'credit-card',
      label: 'Payment Methods',
      onPress: () => navigation.navigate('EditPaymentMethods'),
      options: ['Add Payment Method'],
    },
    {
      icon: 'users',
      label: 'Split Expenses',
      onPress: (option: string) => {
        if (option === 'Split it') {
          navigation.navigate('CreateSplitExpense');
        } else if (option === 'Add Friends') {
          navigation.navigate('AddFriends');
        } else {
          navigation.navigate('SplitExpenseList');
        }
      },
      options: ['Split it', 'Expenses', 'Add Friends'],
    },
    {
      icon: 'bell',
      label: 'Notifications',
      onPress: () => {},
      options: ['Enable Notifications'],
    },
    {
      icon: 'shield',
      label: 'Security & Privacy',
      onPress: () => navigation.navigate('UpdatePassword'),
      options: ['Change Password'],
    },
    {
      icon: 'dollar-sign',
      label: 'Currency Preferences',
      onPress: () => {},
      options: ['Change Currency'],
    },
    {
      icon: 'download',
      label: 'Export Data',
      onPress: () => navigation.navigate('ExportData'),
      options: ['Export Data'],
    },
    {
      icon: 'log-out',
      label: 'Logout',
      onPress: handleLogout,
      options: ['Logout'],
    },
  ];
  const getUser = async () => {
    setLoading(true);
    try {
      const user = await fetchUser();
      setEmail(user.email);
      setName(user.name);
      setProfilePicture(user.profilePicture);
      setMonthlyBudget(user.budget);
      setAmountSpent(user.amountSpent);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = async (image: Asset) => {
    setSelectedImage(image);
    try {
      const {url} = await uploadProfilePicture(image);
      setProfilePicture(url);
      // Update auth context so the Header image updates immediately
      setUser({...user, photoUrl: url});
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      Alert.alert(
        'Error',
        'Failed to upload profile picture. Please try again.',
      );
      setSelectedImage(undefined);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  useEffect(() => {
    getDeviceInfo().then(info => {
      if (info) {
        setDeviceInfo(info);
      }
    });
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          alignItems: 'center',
          paddingVertical: 20,
          backgroundColor: colors.background,
        },
        name: {
          marginTop: 16,
          textAlign: 'center',
        },
        email: {
          marginTop: 4,
          textAlign: 'center',
        },
        phone: {
          marginTop: 8,
          textAlign: 'center',
          color: colors.mutedText,
        },
        statsContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginVertical: 24,
          paddingHorizontal: 16,
          gap: 12,
        },
        statBox: {
          flex: 1,
          backgroundColor: colors.cardBackground,
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          // Shadow for premium feel
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        },
        statLabel: {
          marginBottom: 4,
        },
        statValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.success,
        },
        sectionTitle: {
          marginHorizontal: 20,
          marginTop: 12,
          marginBottom: 16,
        },
        button: {
          backgroundColor: colors.inputBackground,
          padding: 16,
          borderRadius: 14,
          flex: 1,
          alignItems: 'center',
        },
        modalContainer: {
          flex: 1,
          padding: 24,
          gap: 24,
        },
        buttonContainer: {
          flexDirection: 'row',
          gap: 12,
          width: '100%',
        },
        versionSection: {
          marginTop: 32,
          alignItems: 'center',
        },
        madeBySection: {
          marginTop: 8,
          marginBottom: 24,
          alignItems: 'center',
        },
      }),
    [theme],
  );

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 12}}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.header}>
        <ImageUploader
          onImageSelected={handleImageSelected}
          selectedImage={selectedImage}
          isProfilePic
          showUploadIcon
          profilePicture={profilePicture}
        />
        <AppText variant="h3" weight="bold" style={styles.name}>
          {user?.name || name}
        </AppText>
        <AppText variant="h6" color={colors.mutedText} style={styles.email}>
          {user?.email || email}
        </AppText>
        <AppText variant="lg" weight="medium" style={styles.phone}>
          {user?.phoneNumber}
        </AppText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: colors.primary + '15'},
            ]}>
            <Ionicons name="wallet" size={20} color={colors.primary} />
          </View>
          <AppText
            variant="md"
            color={colors.mutedText}
            style={styles.statLabel}>
            Remaining Budget
          </AppText>
          <RupeeIcon
            amount={Math.max(0, monthlyBudget - amountSpent)}
            textStyle={styles.statValue}
          />
        </View>
        <View style={styles.statBox}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: colors.success + '15'},
            ]}>
            <FontAwesome5 name="coins" size={18} color={colors.primary} />
          </View>
          <AppText
            variant="md"
            color={colors.mutedText}
            style={styles.statLabel}>
            Monthly Budget
          </AppText>
          <RupeeIcon amount={monthlyBudget} textStyle={styles.statValue} />
        </View>
      </View>
      <AppText variant="h6" weight="semiBold" style={styles.sectionTitle}>
        Account Settings
      </AppText>
      <FlatList
        data={accountOptionsData}
        renderItem={({item}) => (
          <AccountOption
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            options={item.options}
          />
        )}
        keyExtractor={item => item.label}
      />

      <View style={styles.versionSection}>
        <AppText variant="md" color={colors.mutedText}>
          {`v${deviceInfo?.versionName || ''} (${
            deviceInfo?.versionCode || ''
          })`}
        </AppText>
      </View>

      <View style={styles.madeBySection}>
        <AppText variant="sm" color={colors.mutedText}>
          Made with ❤️ by Rishabh Parsediya
        </AppText>
      </View>

      <Modal
        onCrossPress={() => bottomSheetModalRef.current?.dismiss()}
        headerTitle="Logout"
        variant="viewModal"
        bottomSheetRef={bottomSheetModalRef}
        modalSnapPoints={['35%']}>
        <View style={styles.modalContainer}>
          <AppText variant="h6">Are you sure you want to logout?</AppText>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              style={styles.button}>
              <AppText weight="semiBold" style={{color: colors.buttonText}}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              style={[styles.button, {backgroundColor: colors.error}]}>
              <AppText weight="semiBold" style={{color: 'white'}}>
                Logout
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;
