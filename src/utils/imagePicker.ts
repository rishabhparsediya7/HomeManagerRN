// ImagePickerUtil.ts
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export const pickImageFromCamera = async () => {
  return launchCamera({mediaType: 'photo', saveToPhotos: true});
};

export const pickImageFromGallery = async () => {
  return launchImageLibrary({mediaType: 'photo'});
};
