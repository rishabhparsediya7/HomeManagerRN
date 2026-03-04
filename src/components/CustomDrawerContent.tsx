import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import React, {useMemo} from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import {useAuth} from '../providers/AuthProvider';
import {darkTheme, lightTheme} from '../providers/Theme';
import {useTheme} from '../providers/ThemeContext';
import AppText from './common/AppText';
import Icons from './icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createInitialsForImage} from '../utils/users';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const {user, signOut} = useAuth();
  const {theme, toggleTheme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const menuItems = [
    {
      label: 'Home',
      icon: 'home-outline',
      onPress: () => props.navigation.navigate('Home'),
    },
    {
      label: 'Personal Information',
      icon: 'person-outline',
      onPress: () => props.navigation.navigate('EditPersonalInformation'),
    },
    {
      label: 'Split Expenses',
      icon: 'people-outline',
      onPress: () => props.navigation.navigate('SplitExpenseList'),
    },
    {
      label: 'Security & Privacy',
      icon: 'shield-checkmark-outline',
      onPress: () => props.navigation.navigate('UpdatePassword'),
    },
    {
      label: 'Export Data',
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
        },
        profileImage: {
          width: 60,
          height: 60,
          borderRadius: 30,
          marginBottom: 15,
        },
        initialsContainer: {
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 15,
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
          paddingHorizontal: 20,
          paddingVertical: 14,
          marginHorizontal: 10,
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
        <AppText weight="bold" style={styles.name}>
          {user?.name || 'User'}
        </AppText>
        <AppText style={styles.email}>{user?.email}</AppText>
      </View>

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

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <AppText weight="medium" style={styles.logoutText}>
            Logout
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;
