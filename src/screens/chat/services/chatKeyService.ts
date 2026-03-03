import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  decryptPassphrase,
  decryptPrivateKey,
  encryptPassphrase,
  encryptPrivateKey,
  generateAndStoreKeyPair,
  generatePassphrase,
} from '../../../utils/cryptoUtils';
import {
  savePassphraseToAsyncStorage,
  savePrivateKeyToAsyncStorage,
  savePublicKeyToAsyncStorage,
} from '../../../utils/users';
import api from '../../../services/api';

/**
 * Generates a passphrase, encrypts it, saves locally, and uploads to server.
 */
export async function uploadEncryptedPassphrase(
  userId: string,
): Promise<string> {
  try {
    const passphrase = await generatePassphrase();
    const {cipherText, iv} = await encryptPassphrase(passphrase, userId);
    await savePassphraseToAsyncStorage(passphrase);

    await api.post('/api/chat/upload-passphrase', {
      userId,
      cipherText,
      iv,
    });
    return passphrase;
  } catch (error) {
    console.error('Failed to upload passphrase:', error);
    throw error;
  }
}

/**
 * Initializes the user's encryption keys.
 *
 * Flow:
 * 1. If keys already exist in AsyncStorage, skip.
 * 2. If keys exist on the server, download, decrypt, and store locally.
 * 3. Otherwise, generate a new keypair and upload to server.
 */
export async function initKeys(): Promise<void> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      return;
    }

    const storedPublicKey = await AsyncStorage.getItem('publicKey');
    const storedPrivateKey = await AsyncStorage.getItem('privateKey');

    // Already initialized
    if (storedPublicKey && storedPrivateKey) {
      return;
    }

    // Try downloading from server
    const response = await api.get(`/api/chat/get-user-keys/${userId}`, {
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const encryptedPrivateKey = JSON.parse(
        response?.data?.encryptedPrivateKey,
      );

      const {iv: ivHex, cipherText: encryptedPrivateKeyHex} =
        encryptedPrivateKey;
      const {iv: passphraseIvHex, cipherText: passphraseCipherTextHex} =
        response?.data;
      const passphraseFromServer = await decryptPassphrase(
        passphraseCipherTextHex,
        passphraseIvHex,
        userId,
      );
      await savePassphraseToAsyncStorage(passphraseFromServer);

      const decryptedPrivateKey = await decryptPrivateKey(
        encryptedPrivateKeyHex,
        ivHex,
        passphraseFromServer,
      );
      await savePublicKeyToAsyncStorage(response?.data?.publicKey);
      await savePrivateKeyToAsyncStorage(decryptedPrivateKey);
      return;
    } else {
      console.warn(`No keys found on server. Status: ${response.status}`);
    }

    // Generate new keypair
    const {publicKeyB64, privateKeyB64} = await generateAndStoreKeyPair();
    const passphrase = await uploadEncryptedPassphrase(userId);
    const encryptedPrivateKey = await encryptPrivateKey(
      privateKeyB64,
      passphrase,
    );

    const uploadKeyResponse = await api.post('/api/chat/upload-key', {
      userId,
      publicKey: publicKeyB64,
      privateKey: JSON.stringify(encryptedPrivateKey),
    });

    if (uploadKeyResponse.status === 200) {
      await savePublicKeyToAsyncStorage(publicKeyB64);
      await savePrivateKeyToAsyncStorage(privateKeyB64);
      await savePassphraseToAsyncStorage(passphrase);
    } else {
      console.warn(
        `Failed to upload keys. Status: ${uploadKeyResponse.status}`,
      );
    }
  } catch (error) {
    console.log('🚀 ~ initKeys ~ error:', error);
  }
}
