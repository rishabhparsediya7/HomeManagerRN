import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, Share, Alert} from 'react-native';
import ReactNativeBlobUtil, {FetchBlobResponse} from 'react-native-blob-util';

// not used
export const downloadAndSharePdf = async (
  fileUrl: string,
  suggestedFileName: string,
) => {
  try {
    // 1. Fetch the file and save it to a temporary cache directory
    const resp = await ReactNativeBlobUtil.config({
      fileCache: true, // important for getting the file path
      path: `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${suggestedFileName}`,
    }).fetch('GET', fileUrl);

    const filePath = resp.path();
    const shareableFilePath =
      Platform.OS === 'android' ? `file://${filePath}` : filePath;

    await Share.share({
      title: 'Save PDF',
      message: `Here is your document: ${suggestedFileName}`,
      url: shareableFilePath,
    });

    // The user has now handled the file. We can clean up the temp file if needed,
    // though the OS will eventually clear the cache.
    // await ReactNativeBlobUtil.fs.unlink(filePath);
  } catch (error) {
    if (error.message.includes('User did not share')) {
      console.log('User cancelled the share process.');
    } else {
      console.error('An error occurred:', error);
      Alert.alert('Error', 'Could not download or share the file.');
    }
  }
};

export const generateAndShareExpenseReport = async (filterQuery: string) => {
  const BASE_URL = process.env.BASE_URL;
  const endpoint = `${BASE_URL}/api/expense/generate-report?${filterQuery}`;
  const suggestedFileName = `Expense-Report-${Date.now()}.pdf`;

  try {
    const tempFilePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${suggestedFileName}`;
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Token not found');
    }
    const resp: FetchBlobResponse = await ReactNativeBlobUtil.config({
      path: tempFilePath,
      fileCache: true,
    }).fetch('GET', endpoint, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    if (resp.info().status >= 400) {
      throw new Error(`Server responded with status: ${resp.info().status}`);
    }

    const filePath = resp.path();
    const shareableFilePath =
      Platform.OS === 'android' ? `file://${filePath}` : filePath;

    console.log('[PDF] Triggering Share dialog with URI:', shareableFilePath);

    await Share.share({
      title: 'Export Expense Report',
      url: shareableFilePath,
    });
  } catch (error) {
    console.error('Error during report generation:', error);
    Alert.alert(
      'Export Failed',
      'Could not generate the report. Please try again.',
    );
    throw error;
  }
};
