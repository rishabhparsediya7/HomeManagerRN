import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform } from 'react-native';
import { useTheme } from '../providers/ThemeContext';
import BottomTabNavigator from './bottomTabNavigator';
import {RouteProp} from '@react-navigation/native';
import Dashboard from '../screens/dashboard';
import Home from '../screens/home';
import AddExpense from '../screens/addExpense';
import ChatScreen from '../screens/chat';
import FriendChatScreen from '../screens/chat/friendChat';

export type AuthorizeNavigationStackList = {
  BottomTabNavigator: undefined;
  Home: undefined;
  Dashboard: undefined;
  AddExpense: undefined;
  Chat: undefined;
  FriendChat: { id: string, firstName: string, lastName: string, image: string, lastMessage: string, lastMessageTime: string };
};

export type AuthorizeNavigationProp<
  RouteName extends keyof AuthorizeNavigationStackList,
> = RouteProp<AuthorizeNavigationStackList, RouteName>;

const AuthorizeNavigationStack =
  createStackNavigator<AuthorizeNavigationStackList>();
const AuthorizeNavigation = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Update status bar style based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', false);
      StatusBar.setTranslucent(false);
    }
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  return (
    <AuthorizeNavigationStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AuthorizeNavigationStack.Screen
        name="BottomTabNavigator"
        component={BottomTabNavigator}
      />
      <AuthorizeNavigationStack.Screen
        name="AddExpense"
        component={AddExpense}
      />
      <AuthorizeNavigationStack.Screen name="Home" component={Home} />
      <AuthorizeNavigationStack.Screen name="Dashboard" component={Dashboard} />
      <AuthorizeNavigationStack.Screen name="Chat" component={ChatScreen} />
      <AuthorizeNavigationStack.Screen name="FriendChat" component={FriendChatScreen} />
    </AuthorizeNavigationStack.Navigator>
  );
};

export default AuthorizeNavigation;
