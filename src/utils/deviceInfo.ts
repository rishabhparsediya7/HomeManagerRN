import { NativeModules } from 'react-native';

export type DeviceInfo = {
  versionName: string;
  versionCode?: number; // Android only
  buildNumber?: string; // iOS only
  osVersion: string;
  deviceModel: string;
};

const { DeviceInfoNative } = NativeModules;

export const getDeviceInfo = async (): Promise<DeviceInfo | null> => {
  try {
    return await DeviceInfoNative.getDeviceInfo();
  } catch (error) {
    console.error("Error getting device info", error);
    return null;
  }
};
