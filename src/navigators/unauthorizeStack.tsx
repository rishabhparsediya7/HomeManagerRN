import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/login';
import Onboarding from '../screens/onboarding';
import SignInScreen from '../screens/signin';
import SignUpScreen from '../screens/signup';
import OtpVerificationScreen from '../screens/otpVerification';

export type UnauthorizeNavigationStackList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OtpVerification: undefined;
};

const UnauthorizeNavigationStack =
  createStackNavigator<UnauthorizeNavigationStackList>();

const UnauthorizeNavigation = () => {
  return (
    <UnauthorizeNavigationStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <UnauthorizeNavigationStack.Screen
        name="Onboarding"
        component={Onboarding}
      />
      <UnauthorizeNavigationStack.Screen
        name="SignIn"
        component={SignInScreen}
      />
      <UnauthorizeNavigationStack.Screen
        name="Signup"
        component={SignUpScreen}
      />
      <UnauthorizeNavigationStack.Screen
        name="OTPVerification"
        component={OtpVerificationScreen}
      />
      <UnauthorizeNavigationStack.Screen name="Login" component={Login} />
    </UnauthorizeNavigationStack.Navigator>
  );
};

export default UnauthorizeNavigation;
