import AsyncStorage from '@react-native-async-storage/async-storage';
const PASSPHRASE_KEY = 'passphrase';

export const createInitialsForImage = (name: string) => {
    if (!name) return 'NA';
    const words = name.split(' ');
    let initials = '';
    for (let i = 0; i < words.length; i++) {
        initials += words[i][0].toUpperCase();
    }
    return initials;
}

export const savePassphraseToAsyncStorage = async (passphrase: string) => {
  await AsyncStorage.setItem(PASSPHRASE_KEY, passphrase);
};

export const getPassphraseFromAsyncStorage = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(PASSPHRASE_KEY);
};

export const removePassphraseFromAsyncStorage = async () => {
  await AsyncStorage.removeItem(PASSPHRASE_KEY);
};

export const removePrivateKeyFromAsyncStorage = async () => {
  await AsyncStorage.removeItem('privateKey');
};

export const savePrivateKeyToAsyncStorage = async (privateKey: string) => {
  await AsyncStorage.setItem('privateKey', privateKey);
};

export const savePublicKeyToAsyncStorage = async (publicKey: string) => {
  await AsyncStorage.setItem('publicKey', publicKey);
};

export const getPublicKeyFromAsyncStorage = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('publicKey');
}