// googleSignInUtil.js
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    return { success: true, userInfo };
  } catch (error:any) {
    console.log("🚀 ~ signInWithGoogle ~ error:", error)
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
    return { success: false, error: message };
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error:any) {
    return { success: false, error: error.message };
  }
};
