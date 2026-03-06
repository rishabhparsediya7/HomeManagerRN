import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import React, {useMemo, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../providers/AuthProvider';
import {darkTheme, lightTheme} from '../providers/Theme';
import {useTheme} from '../providers/ThemeContext';
import {createInitialsForImage} from '../utils/users';
import AppGradient from './common/AppGradient';
import AppText from './common/AppText';
import {Modal} from './modal';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const {user, signOut} = useAuth();
  const {theme, toggleTheme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleLogout = () => {
    bottomSheetModalRef.current?.present();
  };

  const menuItems = [
    {
      label: 'Home',
      icon: 'home-outline',
      onPress: () => {
        props.navigation.closeDrawer();
        props.navigation.navigate('MainTabs', {screen: 'Home'});
      },
    },
    {
      label: 'New Split',
      icon: 'git-compare-outline',
      onPress: () => props.navigation.navigate('CreateSplitExpense'),
    },
    {
      label: 'Settlements',
      icon: 'people-outline',
      onPress: () => props.navigation.navigate('SplitExpenseList'),
    },
    {
      label: 'Add Friends',
      icon: 'person-add-outline',
      onPress: () => props.navigation.navigate('AddFriends'),
    },
    {
      label: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => props.navigation.navigate('Notifications'),
    },
    {
      label: 'Reports',
      icon: 'download-outline',
      onPress: () => props.navigation.navigate('ExportData'),
    },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: 20,
          paddingVertical: 30,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        profileImage: {
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 2,
          borderColor: colors.primary,
        },
        initialsContainer: {
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: colors.primaryLight,
        },
        initialsText: {
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
        },
        name: {
          fontSize: 18,
          color: colors.text,
        },
        email: {
          fontSize: 14,
          color: colors.mutedText,
          marginTop: 2,
        },
        drawerItemsContainer: {
          flex: 1,
          paddingTop: 10,
        },
        drawerItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          paddingVertical: 14,
          marginHorizontal: 4,
          borderRadius: 12,
        },
        drawerItemLabel: {
          marginLeft: 15,
          fontSize: 16,
          color: colors.text,
        },
        footer: {
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        },
        magicButton: {
          marginHorizontal: 16,
          marginVertical: 10,
          borderRadius: 16,
          overflow: 'hidden',
        },
        magicGradient: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 12,
          borderRadius: 24,
        },
        magicIconContainer: {
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        themeToggle: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 10,
          marginBottom: 10,
        },
        logoutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 10,
        },
        logoutText: {
          marginLeft: 15,
          fontSize: 16,
          color: colors.error,
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
        button: {
          backgroundColor: colors.inputBackground,
          padding: 16,
          borderRadius: 14,
          flex: 1,
          alignItems: 'center',
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {user?.photoUrl ? (
          <Image source={{uri: user.photoUrl}} style={styles.profileImage} />
        ) : (
          <View style={styles.initialsContainer}>
            <AppText style={styles.initialsText}>
              {createInitialsForImage(user?.name || '')}
            </AppText>
          </View>
        )}
        <View style={{flex: 1}}>
          <AppText weight="bold" style={styles.name}>
            {user?.name || 'User'}
          </AppText>
          <AppText style={styles.email}>{user?.email}</AppText>
        </View>
      </View>

      {/* Magic Add Button */}
      <TouchableOpacity
        style={styles.magicButton}
        activeOpacity={0.85}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate('QuickAddExpense', {type: null});
        }}>
        <AppGradient style={styles.magicGradient}>
          <View style={styles.magicIconContainer}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View style={{flex: 1}}>
            <AppText weight="bold" style={{color: '#fff', fontSize: 15}}>
              Quick Add
            </AppText>
            <AppText style={{color: 'rgba(255,255,255,0.75)', fontSize: 11}}>
              Add expense magically
            </AppText>
          </View>
          <Ionicons name="add-circle" size={24} color="rgba(255,255,255,0.9)" />
        </AppGradient>
      </TouchableOpacity>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{paddingTop: 0}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.drawerItemsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={item.onPress}>
              <Ionicons name={item.icon} size={22} color={colors.text} />
              <AppText style={styles.drawerItemLabel}>{item.label}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons
              name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={colors.text}
            />
            <AppText style={styles.drawerItemLabel}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <AppText weight="medium" style={styles.logoutText}>
            Logout
          </AppText>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
};

export default CustomDrawerContent;
