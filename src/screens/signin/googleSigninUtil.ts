import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Platform} from 'react-native';

export const googleSignIn = async () => {
  if (Platform.OS === 'ios') {
    return {success: false, error: 'Google Sign-in is not supported on iOS'};
  }
  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const userInfo = await GoogleSignin.signIn();
    return {success: true, userInfo};
  } catch (error: any) {
    let message = 'Something went wrong';
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      message = 'User cancelled the login process';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      message = 'Sign in is in progress already';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      message = 'Google Play Services not available or outdated';
    } else {
      message = error.message;
    }
    return {success: false, error: message};
  }
};

export const signOutGoogle = async () => {
  if (Platform.OS === 'ios') {
    return {success: true};
  }
  try {
    await GoogleSignin.signOut();
    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
};
