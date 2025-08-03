// utils/cryptoUtil.js
import 'react-native-get-random-values'; // 👈 MUST BE FIRST

import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import * as Keychain from 'react-native-keychain';

export async function generateAndStoreKeyPair() {
    try {
      const keyPair = nacl.box.keyPair();
      console.log("🚀 ~ Keypair Generated ~ keyPair:", keyPair)
      const publicKeyB64 = naclUtil.encodeBase64(keyPair.publicKey);
      const privateKeyB64 = naclUtil.encodeBase64(keyPair.secretKey);
  
      try {
        // Try storing with highest security level
        await Keychain.setGenericPassword(publicKeyB64, privateKeyB64, {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        });
      } catch (secureErr) {
        console.warn("SECURE_HARDWARE not supported. Falling back to ANY.", secureErr);
  
        // Fallback to lower security if needed
        await Keychain.setGenericPassword(publicKeyB64, privateKeyB64, {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.ANY,
        });
      }
  
      return publicKeyB64;
    } catch (error) {
      console.error("Key generation/storage failed:", error);
      throw new Error("Could not securely generate/store keypair.");
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
    