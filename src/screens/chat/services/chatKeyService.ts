import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  decryptPassphrase,
  decryptPrivateKey,
  encryptPassphrase,
  encryptPrivateKey,
  generateAndStoreKeyPair,
  generatePassphrase,
  getStoredKeyPair,
} from '../../../utils/cryptoUtils';
import {
  savePassphraseToAsyncStorage,
  savePrivateKeyToAsyncStorage,
  savePublicKeyToAsyncStorage,
} from '../../../utils/users';
import api from '../../../services/api';

/**
 * Initializes the user's encryption keys.
 *
 * Flow:
 * 1. If keys already exist in AsyncStorage, skip.
 * 2. If keys exist in Keychain, restore to AsyncStorage and skip. (CRUCIAL for reinstalls)
 * 3. If keys exist on the server, download, decrypt, and store locally.
 * 4. Otherwise, generate a new keypair and upload to server.
 */
export async function initKeys(): Promise<void> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.warn('[initKeys] No userId found in AsyncStorage');
      return;
    }

    const storedPublicKey = await AsyncStorage.getItem('publicKey');
    const storedPrivateKey = await AsyncStorage.getItem('privateKey');

    // 1. Already initialized in AsyncStorage
    if (storedPublicKey && storedPrivateKey) {
      console.log('[initKeys] Keys found in AsyncStorage, skipping init');
      return;
    }

    // 2. Check Keychain (e.g. after reinstall)
    const keychainPair = await getStoredKeyPair();
    if (keychainPair) {
      console.log(
        '[initKeys] Keys found in Keychain, restored to AsyncStorage',
      );
      const pubB64 = Buffer.from(keychainPair.publicKey).toString('base64');
      const privB64 = Buffer.from(keychainPair.secretKey).toString('base64');
      await savePublicKeyToAsyncStorage(pubB64);
      await savePrivateKeyToAsyncStorage(privB64);
      return;
    }

    // 3. Try recovering from server
    console.log('[initKeys] No local keys found, checking server...');
    const response = await api.get(`/api/chat/get-user-keys/${userId}`, {
      validateStatus: () => true,
    });

    if (response.status === 200) {
      console.log('[initKeys] Found keys on server, attempting recovery...');
      try {
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

        const decryptedPrivateKey = await decryptPrivateKey(
          encryptedPrivateKeyHex,
          ivHex,
          passphraseFromServer,
        );

        await savePassphraseToAsyncStorage(passphraseFromServer);
        await savePublicKeyToAsyncStorage(response?.data?.publicKey);
        await savePrivateKeyToAsyncStorage(decryptedPrivateKey);
        console.log('[initKeys] Successfully recovered keys from server');
        return;
      } catch (recoveryErr) {
        console.error(
          '[initKeys] Server keys exist but recovery failed:',
          recoveryErr,
        );
        // CRITICAL: If recovery fails, we do NOT want to generate new keys and overwrite
        // because that would permanently lose access to old messages.
        return;
      }
    }

    // 4. Generate new keys ONLY if they don't exist on server (status 404)
    if (response.status === 404) {
      console.log('[initKeys] No keys on server, generating new pair...');
      const {publicKeyB64, privateKeyB64} = await generateAndStoreKeyPair();

      // Generate a new passphrase
      const passphrase = await generatePassphrase();
      const {cipherText, iv} = await encryptPassphrase(passphrase, userId);

      // Upload passphrase
      await api.post('/api/chat/upload-passphrase', {
        userId,
        cipherText,
        iv,
      });

      // Encrypt and upload private key
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
        console.log('[initKeys] Successfully generated and uploaded new keys');
      } else {
        console.error(
          '[initKeys] Failed to upload new keys:',
          uploadKeyResponse.status,
        );
      }
    } else {
      console.warn(
        '[initKeys] Server error during key check:',
        response.status,
      );
    }
  } catch (error) {
    console.log('🚀 ~ initKeys ~ error:', error);
  }
}
