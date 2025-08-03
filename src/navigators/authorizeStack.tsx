import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
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
  Chat: { id: number, name: string, image: string, lastMessage: string, timestamp: string };
  FriendChat: { id: number, name: string, image: string, lastMessage: string, timestamp: string };
};

export type AuthorizeNavigationProp<
  RouteName extends keyof AuthorizeNavigationStackList,
> = RouteProp<AuthorizeNavigationStackList, RouteName>;

const AuthorizeNavigationStack =
  createStackNavigator<AuthorizeNavigationStackList>();
const AuthorizeNavigation = () => {
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
