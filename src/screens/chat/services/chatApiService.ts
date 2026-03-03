import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import {Message} from '../../../store';
import socket from '../../../utils/socket';
import {
  decryptMessage,
  encryptMessage,
  getMySecretKey,
  getReceiverPublicKey,
} from './chatCryptoService';

/**
 * Fetches chat history from the API and decrypts all messages.
 */
export async function fetchAndDecryptChatHistory(
  withUser: string,
  before?: string,
): Promise<{messages: Message[]; hasMore: boolean}> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const mySK = await getMySecretKey();
    const theirPub = await getReceiverPublicKey(withUser);

    let url = `/api/chat/history?userId=${userId}&withUser=${withUser}&limit=50`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }

    const response = await api.get(url);
    const {messages: rawMessages, hasMore} = response.data;

    const decryptedMessages: Message[] = (rawMessages || []).map((msg: any) => {
      const plaintext = decryptMessage(msg.message, msg.nonce, theirPub, mySK);

      return {
        id: msg.id,
        message: msg.message,
        nonce: msg.nonce,
        sender_id: msg.sender_id || msg.senderId,
        receiver_id: msg.receiver_id || msg.receiverId,
        sent_at: msg.sent_at || msg.sentAt,
        plaintext:
          plaintext ??
          '[These messages are from before you reinstalled the app and can no longer be decrypted]',
      };
    });

    return {messages: decryptedMessages, hasMore};
  } catch (error) {
    console.error('Failed to fetch and decrypt chat:', error);
    return {messages: [], hasMore: false};
  }
}

/**
 * Encrypts a plaintext message and emits it via socket.
 */
export async function sendEncryptedMessage(
  senderId: string,
  receiverId: string,
  plaintext: string,
): Promise<void> {
  const mySK = await getMySecretKey();
  const theirPub = await getReceiverPublicKey(receiverId);
  const {cipher, nonce} = encryptMessage(plaintext, theirPub, mySK);

  socket.emit('send-message', {
    senderId,
    receiverId,
    message: cipher,
    nonce,
  });
}

/**
 * Decrypts a single message preview (e.g. for the friends list).
 * Returns the plaintext, or null if decryption fails.
 */
export async function decryptSingleMessage(
  senderId: string,
  encryptedMsg: string,
  nonce: string,
): Promise<string | null> {
  const mySK = await getMySecretKey();
  const theirPub = await getReceiverPublicKey(senderId);
  return decryptMessage(encryptedMsg, nonce, theirPub, mySK);
}

/**
 * Decrypts a received socket message payload.
 * Returns the plaintext or null.
 */
export async function decryptReceivedMessage(
  senderId: string,
  encryptedMsg: string,
  nonce: string,
): Promise<string | null> {
  const mySK = await getMySecretKey();
  const theirPub = await getReceiverPublicKey(senderId);
  return decryptMessage(encryptedMsg, nonce, theirPub, mySK);
}

/**
 * Fetches the friends list for the current user from the API.
 */
export async function fetchFriends(userId: string): Promise<any[]> {
  const resp = await api.get(`/api/chat/getFriends/${userId}`);
  return resp.data;
}

/**
 * Fetches the encryption keys for a specific user.
 */
export async function fetchUserKeys(userId: string): Promise<any> {
  return await api.get(`/api/chat/get-user-keys/${userId}`, {
    validateStatus: () => true,
  });
}

/**
 * Uploads a user's encryption keys to the server.
 */
export async function uploadKey(params: {
  userId: string;
  publicKey: string;
  privateKey: string;
  force?: boolean;
}): Promise<any> {
  return await api.post('/api/chat/upload-key', params);
}

/**
 * Uploads an encrypted passphrase to the server.
 */
export async function uploadPassphrase(params: {
  userId: string;
  cipherText: string;
  iv: string;
  force?: boolean;
}): Promise<any> {
  return await api.post('/api/chat/upload-passphrase', params);
}
