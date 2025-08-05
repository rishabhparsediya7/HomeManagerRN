import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { decryptPassphrase, decryptPrivateKey, encryptPassphrase, encryptPrivateKey, generateAndStoreKeyPair, generatePassphrase, getStoredKeyPair, resetKeyPair } from '../../utils/cryptoUtils';
import FriendsScreen from './friends';
import { savePassphraseToAsyncStorage, savePrivateKeyToAsyncStorage, savePublicKeyToAsyncStorage } from '../../utils/users';

const uploadEncryptedPassphrase = async (userId: string) => {
    try {
        const passphrase = await generatePassphrase();
        const { cipherText, iv } = await encryptPassphrase(passphrase, userId);
        await savePassphraseToAsyncStorage(passphrase);

        await axios.post('https://0e622c717fbb.ngrok-free.app/api/chat/upload-passphrase', {
            headers: { 'Content-Type': 'application/json' },
            userId,
            cipherText,
            iv,
        });
        return passphrase
    }
    catch (error) {
        console.error('Failed to upload passphrase:', error);
        throw error;
    }
};

async function initKeys() {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log("🚀 ~ initKeys ~ userId:", userId)
            return;
        }
        const storedPublicKey = await AsyncStorage.getItem('publicKey');
        const storedPrivateKey = await AsyncStorage.getItem('privateKey');

        if (storedPublicKey && storedPrivateKey) {
            console.log("🚀 ~ initKeys ~ storedPublicKey, storedPrivateKey:", storedPublicKey, storedPrivateKey)
            return;
        }

        const response = await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/get-user-keys/${userId}`, { validateStatus: () => true });
        if (response.status === 200) {
            console.log("🚀 ~ initKeys ~ response.data:", response.data)
            const encryptedPrivateKey = JSON.parse(response?.data?.encryptedPrivateKey);
            console.log("🚀 ~ initKeys ~ encryptedPrivateKey:", encryptedPrivateKey)

            const { iv: ivHex, cipherText: encryptedPrivateKeyHex } = encryptedPrivateKey;
            const { iv: passphraseIvHex, cipherText: passphraseCipherTextHex } = response?.data;
            const passphraseFromServer = await decryptPassphrase(passphraseCipherTextHex, passphraseIvHex, userId);
            console.log("🚀 ~ initKeys ~ passphraseFromServer:", passphraseFromServer)
            await savePassphraseToAsyncStorage(passphraseFromServer);

            const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKeyHex, ivHex, passphraseFromServer);
            console.log("🚀 ~ initKeys ~ decryptedPrivateKey:", decryptedPrivateKey)
            await savePublicKeyToAsyncStorage(response?.data?.publicKey);
            await savePrivateKeyToAsyncStorage(decryptedPrivateKey);
            return;
        }
        else {
            console.warn(`No keys found on server. Status: ${response.status}`);
        }


        const { publicKeyB64, privateKeyB64 } = await generateAndStoreKeyPair();
        const passphrase = await uploadEncryptedPassphrase(userId!);
        const encryptedPrivateKey = await encryptPrivateKey(privateKeyB64, passphrase);

        console.log("🚀 ~ initKeys ~ userId:", userId)
        const uploadKeyResponse = await axios.post('https://0e622c717fbb.ngrok-free.app/api/chat/upload-key', {
            userId,
            publicKey: publicKeyB64,
            privateKey: JSON.stringify(encryptedPrivateKey),
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        console.log("🚀 ~ initKeys ~ uploadKeyResponse:", uploadKeyResponse)
        if (uploadKeyResponse.status === 200) {
            await savePublicKeyToAsyncStorage(publicKeyB64);
            await savePrivateKeyToAsyncStorage(privateKeyB64);
            await savePassphraseToAsyncStorage(passphrase);
        }
        else {
            console.warn(`Failed to upload keys. Status: ${uploadKeyResponse.status}`);
        }
    }
    catch (error) {
        console.log("🚀 ~ initKeys ~ error:", error)
    }
}

const ChatScreen = () => {
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState([]);

    const fetchFriends = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        setLoading(true);
        try {
            const resp = await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/getFriends/${userId}`);
            setFriends(resp.data);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        initKeys();
    }, []);

    return (
        <FriendsScreen friends={friends} loading={loading} />
    );
};

export default ChatScreen;