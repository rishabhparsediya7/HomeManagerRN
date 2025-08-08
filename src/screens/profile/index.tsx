// screens/Profile.js
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ColorSchemeName,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset } from 'react-native-image-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AccountOption from '../../components/accountOptions';
import ImageUploader from '../../components/imageUploader';
import { Modal } from '../../components/modal';
import RupeeIcon from '../../components/rupeeIcon';
import { useAuth } from '../../providers/AuthProvider';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useTheme } from '../../providers/ThemeContext';
import api from '../../services/api';
import { commonStyles } from '../../utils/styles';

const Profile = () => {
  const {signOut, user} = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedImage, setSelectedImage] = useState<Asset | undefined>(
    undefined,
  );
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {theme, toggleTheme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleToggleTheme = (theme: ColorSchemeName) => {
    if(theme){
      toggleTheme(theme.toLowerCase() as ColorSchemeName);
    }
  }

  const handleLogout = () => {
    bottomSheetModalRef.current?.present();
  };

  const accountOptionsData = [
    {
      icon: 'edit',
      label: 'Personal Information',
      onPress: () => {},
      options: ['Edit Personal Information'],
    },
    {
      icon: 'dark-mode',
      label: 'Theme',
      onPress: handleToggleTheme,
      options: ['Light', 'Dark'],
    },
    {
      icon: 'credit-card',
      label: 'Payment Methods',
      onPress: () => {},
      options: ['Add Payment Method'],
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
      onPress: () => {},
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
      onPress: () => {},
      options: ['Export Data'],
    },
    {
      icon: 'log-out',
      label: 'Logout',
      onPress: handleLogout,
      options: ['Logout'],
    },
  ]
  const getUser = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/me');
      console.log(response.data);
      setEmail(response.data.user.email);
      setName(response.data.user.name);
      setProfilePicture(response.data.user.profilePicture);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  const styles = useMemo(() => StyleSheet.create({
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
      fontSize: 22,
      color: colors.buttonText,
      ...commonStyles.textDefault,
      marginTop: 12,
    },
    email: {
      fontSize: 14,
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 20,
      paddingHorizontal: 16,
      gap: 8,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 14,
      color: colors.buttonText,
      ...commonStyles.textDefault,
      marginTop: 6,
    },
    statValue: {
      fontSize: 18,
      color: colors.buttonText,
      ...commonStyles.textDefault,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      color: colors.buttonText,
      ...commonStyles.textDefault,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 10,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      flex: 1,
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      flexDirection: 'column',
      padding: 20,
      gap: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 8,
      width: '100%',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
    modalText: {
      fontSize: 16,
      ...commonStyles.textDefault,
      color: colors.buttonText,
      // textAlign: 'center',
    },
  }), [theme]);

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 100}}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.header}>
        <ImageUploader
          onImageSelected={image => setSelectedImage(image)}
          selectedImage={selectedImage}
          isProfilePic
          showUploadIcon
          profilePicture={profilePicture}
        />
        <Text style={styles.name}>{user?.name || name}</Text>
        <Text style={styles.email}>{user?.email || email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="wallet" size={24} color={colors.buttonText} />
          <Text style={styles.statLabel}>Remaining Budget</Text>
          <RupeeIcon amount={12450} />
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="coins" size={24} color={colors.buttonText} />
          <Text style={styles.statLabel}>Monthly Budget</Text>
          <RupeeIcon amount={3000} />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Account Settings</Text>
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

      <Modal
        onCrossPress={() => bottomSheetModalRef.current?.dismiss()}
        headerTitle="Logout"
        variant="scrollableModal"
        bottomSheetRef={bottomSheetModalRef}
        modalSnapPoints={['35%']}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Are you sure you want to logout?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};



export default Profile;
