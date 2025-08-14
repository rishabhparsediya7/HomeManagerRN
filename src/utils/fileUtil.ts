import { Platform, Share, Alert } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * Fetches a PDF from a URL and opens the native Share dialog to allow the user
 * to save it wherever they want.
 *
 * @param {string} fileUrl The URL of the PDF file to download.
 * @param {string} suggestedFileName A default name for the file, e.g., 'report.pdf'.
 */
export const downloadAndSharePdf = async (fileUrl: string, suggestedFileName: string) => {
  try {
    // 1. Fetch the file and save it to a temporary cache directory
    console.log('Starting fetch...');
    const resp = await ReactNativeBlobUtil.config({
      fileCache: true, // important for getting the file path
      path: `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${suggestedFileName}`,
    }).fetch('GET', fileUrl);

    console.log('File saved temporarily to:', resp.path());

    // 2. Trigger the Share dialog
    // We must use 'file://' prefix for the URL on Android
    const filePath = resp.path();
    const shareableFilePath = Platform.OS === 'android' ? `file://${filePath}` : filePath;
    
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