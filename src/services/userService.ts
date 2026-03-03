import {Asset} from 'react-native-image-picker';
import {Platform} from 'react-native';
import api from './api';

export interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
  budget: number;
  amountSpent: number;
  phoneNumber?: string;
  userLoginProvider?: string;
}

/**
 * Fetches the current user's profile from the API.
 */
export async function getUser(): Promise<UserProfile> {
  const response = await api.get('/api/users/me');
  const user = response.data.user;

  return {
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    budget: Number(user.budget || 0),
    amountSpent: Number(user.amountSpent || 0),
    phoneNumber: user.phoneNumber,
    userLoginProvider: user.userLoginProvider,
  };
}

/**
 * Uploads a profile picture to R2 via the backend.
 * Uses multipart/form-data to send the image file.
 * @returns The presigned URL of the uploaded image.
 */
export async function uploadProfilePicture(
  image: Asset,
): Promise<{url: string}> {
  const formData = new FormData();

  formData.append('image', {
    uri: Platform.OS === 'ios' ? image.uri?.replace('file://', '') : image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'profile.jpg',
  } as any);

  const response = await api.post('/api/users/upload-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {url: response.data.url};
}

/**
 * Fetches the presigned URL for the current user's profile picture.
 */
export async function getProfilePicture(): Promise<string> {
  const response = await api.get('/api/users/profile-pic');
  return response.data.url;
}

/**
 * Updates the user's profile information.
 */
export async function updateProfile(data: {
  name: string;
  email: string;
  phoneNumber: string;
}): Promise<void> {
  await api.put('/api/users/update-profile', data);
}
