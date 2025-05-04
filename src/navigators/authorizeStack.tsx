import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigator from './bottomTabNavigator';
import {RouteProp} from '@react-navigation/native';
import Dashboard from '../screens/dashboard';
import Home from '../screens/home';
import AddExpense from '../screens/addExpense';

export type AuthorizeNavigationStackList = {
  BottomTabNavigator: undefined;
  Home: undefined;
  Dashboard: undefined;
  AddExpense: undefined;
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
    </AuthorizeNavigationStack.Navigator>
  );
};

export default AuthorizeNavigation;
