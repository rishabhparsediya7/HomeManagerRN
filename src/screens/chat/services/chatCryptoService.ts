import AsyncStorage from '@react-native-async-storage/async-storage';
import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import {getStoredKeyPair} from '../../../utils/cryptoUtils';
import api from '../../../services/api';

/**
 * Gets the current user's secret (private) key.
 * Tries Keychain first, then falls back to AsyncStorage.
 */
export async function getMySecretKey(): Promise<Uint8Array> {
  const pair = await getStoredKeyPair();
  if (pair?.secretKey) {
    return pair.secretKey;
  }

  // Fallback: initKeys() stores keys in AsyncStorage, not Keychain.
  // On reinstall, Keychain is wiped but AsyncStorage has the keys.
  const storedKey = await AsyncStorage.getItem('privateKey');
  if (storedKey) {
    return naclUtil.decodeBase64(storedKey);
  }

  throw new Error('Secret key not found in Keychain or AsyncStorage');
}

/**
 * Fetches a user's public key from the server.
 */
export async function getReceiverPublicKey(
  userId: string,
): Promise<Uint8Array> {
  const resp = await api.get(`/api/chat/get-user-keys/${userId}`);
  const {publicKey: pubB64} = resp.data;

  if (!pubB64) {
    throw new Error(`No public key found for user ${userId}`);
  }

  return naclUtil.decodeBase64(pubB64);
}

/**
 * Decrypts a single NaCl box-encrypted message.
 * Returns the plaintext string, or null if decryption fails.
 */
export function decryptMessage(
  encryptedMessage: string,
  nonce: string,
  theirPublicKey: Uint8Array,
  mySecretKey: Uint8Array,
): string | null {
  const decrypted = nacl.box.open(
    naclUtil.decodeBase64(encryptedMessage),
    naclUtil.decodeBase64(nonce),
    theirPublicKey,
    mySecretKey,
  );

  if (decrypted) {
    return naclUtil.encodeUTF8(decrypted);
  }

  return null;
}

/**
 * Encrypts a plaintext message using NaCl box.
 * Returns the cipher and nonce as Base64 strings.
 */
export function encryptMessage(
  plaintext: string,
  theirPublicKey: Uint8Array,
  mySecretKey: Uint8Array,
): {cipher: string; nonce: string} {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const cipher = nacl.box(
    naclUtil.decodeUTF8(plaintext),
    nonce,
    theirPublicKey,
    mySecretKey,
  );

  return {
    cipher: naclUtil.encodeBase64(cipher),
    nonce: naclUtil.encodeBase64(nonce),
  };
}
