// permissions.ts
import {Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';

export const requestCameraPermission = async () => {
  const permission =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};

export const requestGalleryPermission = async () => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : Platform.OS === 'android' && Platform.Version >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};


export const checkStoragePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Platform.Version;
  let permissionsToCheck;

  if (apiLevel >= 33) {
    permissionsToCheck = [
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ];
  } else {
    permissionsToCheck = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
  }

  try {
    const statuses = await PermissionsAndroid.requestMultiple(permissionsToCheck);
    const isGranted = Object.values(statuses).some(
      status => status === PermissionsAndroid.RESULTS.GRANTED
    );
    return isGranted;
  } catch (err) {
    console.error('Failed to check storage permissions', err);
    return false;
  }
};

export const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Platform.Version;

  try {
    let permissionsToRequest;
    if (apiLevel >= 33) {
      // Android 13+
      permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ];
    } else {
      permissionsToRequest = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
    }
    
    const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

    if (
      granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('Android 13+ Media permissions granted.');
      return true;
    } else if (
      granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('External storage permission granted.');
      return true;
    } else {
      console.log('Storage permission denied.');
      return false;
    }
  } catch (err) {
    console.error('Failed to request storage permissions', err);
    return false;
  }
};