import React from 'react';
import {
  View,
  Button,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../utils/permissions';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ImageUploaderProps {
  onImageSelected: (image: Asset) => void;
  selectedImage?: Asset;
  isProfilePic?: boolean;
  showUploadIcon?: boolean;
  profilePicture?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  isProfilePic,
  showUploadIcon,
  profilePicture,
}) => {
  const handleImagePick = () => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const granted = await requestCameraPermission();
            if (granted) {
              const res = await launchCamera({mediaType: 'photo'});
              if (res.assets && res.assets.length > 0) {
                onImageSelected(res.assets[0]);
              }
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const granted = await requestGalleryPermission();
            if (granted) {
              const res = await launchImageLibrary({mediaType: 'photo'});
              if (res.assets && res.assets.length > 0) {
                onImageSelected(res.assets[0]);
              }
            }
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={
            selectedImage?.uri || profilePicture
              ? {uri: selectedImage?.uri || profilePicture}
              : require('../../../assets/images/avatar.gif')
          }
          style={styles.image}
        />
        {showUploadIcon && (
          <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
            <Ionicons
              name="create-outline"
              style={{alignSelf: 'center'}}
              color="white"
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ImageUploader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 6,
    paddingLeft: 8,
    paddingBottom: 8,
    zIndex: 10,
  },
});
