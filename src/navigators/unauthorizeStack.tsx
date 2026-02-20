import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, Platform} from 'react-native';
import Onboarding from '../screens/onboarding';
import SignInScreen from '../screens/signin';
import SignUpScreen from '../screens/signup';
import OtpVerificationScreen from '../screens/otpVerification';
import ForgotPassword from '../screens/forgotPassword';
import ForgotPasswordOTPVerificationScreen from '../screens/forgotPassword/otpVerification';
import ForgotPasswordResetScreen from '../screens/forgotPassword/resetPassword';

export type UnauthorizeNavigationStackList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OtpVerification: undefined;
  ForgotPassword: undefined;
  ForgotPasswordOTPVerification: {email: string};
  ForgotPasswordReset: {email: string; otp: string};
};

const UnauthorizeNavigationStack =
  createStackNavigator<UnauthorizeNavigationStackList>();

const UnauthorizeNavigation = () => {
  // Set status bar style for unauthorized screens
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle('light-content');

    return () => {
      // Reset status bar when leaving unauthorized screens
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(false);
      }
    };
  }, []);

  return (
    <UnauthorizeNavigationStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: 'transparent'},
        cardOverlayEnabled: true,
        cardStyleInterpolator: ({current: {progress}}) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
          overlayStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
              extrapolate: 'clamp',
            }),
          },
        }),
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
      <UnauthorizeNavigationStack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
      />
      <UnauthorizeNavigationStack.Screen
        name="ForgotPasswordOTPVerification"
        component={ForgotPasswordOTPVerificationScreen}
      />
      <UnauthorizeNavigationStack.Screen
        name="ForgotPasswordReset"
        component={ForgotPasswordResetScreen}
      />
    </UnauthorizeNavigationStack.Navigator>
  );
};

export default UnauthorizeNavigation;
