import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/login';

export type UnauthorizeNavigationStackList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: undefined;
};

const UnauthorizeNavigationStack =
  createStackNavigator<UnauthorizeNavigationStackList>();

const UnauthorizeNavigation = () => {
  return (
    <UnauthorizeNavigationStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <UnauthorizeNavigationStack.Screen name="Login" component={Login} />
    </UnauthorizeNavigationStack.Navigator>
  );
};

export default UnauthorizeNavigation;
