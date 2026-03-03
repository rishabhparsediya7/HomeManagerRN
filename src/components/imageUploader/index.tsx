import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../utils/permissions';
import {useAuth} from '../../providers/AuthProvider';
import {createInitialsForImage} from '../../utils/users';

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
  const {user} = useAuth();
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
        {selectedImage?.uri || profilePicture ? (
          <Image
            source={{uri: selectedImage?.uri || profilePicture}}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.initialsContainer]}>
            <Text style={styles.initialsText}>
              {createInitialsForImage(user?.name || '')}
            </Text>
          </View>
        )}
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
  initialsContainer: {
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
});
