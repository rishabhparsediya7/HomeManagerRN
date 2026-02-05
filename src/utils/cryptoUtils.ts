// utils/cryptoUtil.js
import 'react-native-get-random-values'; // 👈 MUST BE FIRST

import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import * as Keychain from 'react-native-keychain';
import RNSimpleCrypto from 'react-native-simple-crypto';
import {Buffer} from 'buffer';
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT = 'trakio_salt';

export async function generateAndStoreKeyPair() {
  try {
    const keyPair = nacl.box.keyPair();
    const publicKeyB64 = naclUtil.encodeBase64(keyPair.publicKey);
    const privateKeyB64 = naclUtil.encodeBase64(keyPair.secretKey);

    try {
      // Try storing with highest security level
      await Keychain.setGenericPassword(publicKeyB64, privateKeyB64, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });
    } catch (secureErr) {
      console.warn(
        'SECURE_HARDWARE not supported. Falling back to ANY.',
        secureErr,
      );

      // Fallback to lower security if needed
      await Keychain.setGenericPassword(publicKeyB64, privateKeyB64, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.ANY,
      });
    }

    return {publicKeyB64, privateKeyB64};
  } catch (error) {
    console.error('Key generation/storage failed:', error);
    throw new Error('Could not securely generate/store keypair.');
  }
}

export async function getStoredKeyPair(): Promise<{
  publicKey: Uint8Array;
  secretKey: Uint8Array;
} | null> {
  const cred = await Keychain.getGenericPassword();
  if (!cred) return null;
  return {
    publicKey: naclUtil.decodeBase64(cred.username),
    secretKey: naclUtil.decodeBase64(cred.password),
  };
}

export async function resetKeyPair() {
  await Keychain.resetGenericPassword();
}

export async function generateRandomBytes(length: number): Promise<Uint8Array> {
  const arrayBuffer = await RNSimpleCrypto.utils.randomBytes(length);
  return new Uint8Array(arrayBuffer);
}

export async function deriveKeyPBKDF2(
  passphrase: string,
  salt: string,
): Promise<string> {
  const key = await RNSimpleCrypto.PBKDF2.hash(
    passphrase,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'SHA256',
  );

  return RNSimpleCrypto.utils.convertArrayBufferToHex(key);
}

//////////////////////
// Private Key Encryption
//////////////////////
export async function encryptPrivateKey(
  privateKey: string,
  passphrase: string,
): Promise<{iv: string; cipherText: string}> {
  const iv = await generateRandomBytes(16);
  const key = await deriveKeyPBKDF2(passphrase, SALT);

  const cipherText = await RNSimpleCrypto.AES.encrypt(
    RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(privateKey),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(key),
    iv,
  );

  return {
    iv: RNSimpleCrypto.utils.convertArrayBufferToHex(iv),
    cipherText: RNSimpleCrypto.utils.convertArrayBufferToHex(cipherText),
  };
}

export async function decryptPrivateKey(
  cipherTextHex: string,
  ivHex: string,
  passphrase: string,
): Promise<string> {
  const key = await deriveKeyPBKDF2(passphrase, SALT);

  const decrypted = await RNSimpleCrypto.AES.decrypt(
    RNSimpleCrypto.utils.convertHexToArrayBuffer(cipherTextHex),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(key),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(ivHex),
  );

  return RNSimpleCrypto.utils.convertArrayBufferToUtf8(decrypted);
}

//////////////////////
// Passphrase Encryption
//////////////////////
export async function encryptPassphrase(
  passphrase: string,
  masterKey: string,
): Promise<{iv: string; cipherText: string}> {
  const iv = await generateRandomBytes(16);
  const key = await deriveKeyPBKDF2(masterKey, SALT);

  const cipherText = await RNSimpleCrypto.AES.encrypt(
    RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(passphrase),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(key),
    iv,
  );

  return {
    iv: RNSimpleCrypto.utils.convertArrayBufferToHex(iv),
    cipherText: RNSimpleCrypto.utils.convertArrayBufferToHex(cipherText),
  };
}

export async function decryptPassphrase(
  cipherTextHex: string,
  ivHex: string,
  masterKey: string,
): Promise<string> {
  const key = await deriveKeyPBKDF2(masterKey, SALT);

  const decrypted = await RNSimpleCrypto.AES.decrypt(
    RNSimpleCrypto.utils.convertHexToArrayBuffer(cipherTextHex),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(key),
    RNSimpleCrypto.utils.convertHexToArrayBuffer(ivHex),
  );

  return RNSimpleCrypto.utils.convertArrayBufferToUtf8(decrypted);
}

export const generatePassphrase = async (
  length: number = 32,
): Promise<string> => {
  const random = await RNSimpleCrypto.utils.randomBytes(length);
  return Buffer.from(random).toString('base64');
};
