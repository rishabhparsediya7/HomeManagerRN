import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { generateAndStoreKeyPair, getStoredKeyPair, resetKeyPair } from '../../utils/cryptoUtils';
import FriendsScreen from './friends';

async function initKeys() {
    try {
        const pair = await getStoredKeyPair();
        if (pair) return;
        const publicKeyB64 = await generateAndStoreKeyPair();
        const userId = await AsyncStorage.getItem('userId');
        const response = await axios.post('https://1222457b3111.ngrok-free.app/api/chat/upload-key', {
            userId,
            publicKey: publicKeyB64,
        });

        if (response.data.success) {
            console.log('Key uploaded successfully');
        }
        else {
            resetKeyPair();
            throw new Error(response.data.message);
        }
    }
    catch (error) {
        console.error('Failed to upload key:', error);
        resetKeyPair();
        throw error;
    }
}

const ChatScreen = () => {
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState([]);
    
    const fetchFriends = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if(!userId) return;
        setLoading(true);
        try {
            const resp = await axios.get(`https://1222457b3111.ngrok-free.app/api/chat/getFriends/${userId}`);
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
      <FriendsScreen friends={friends} loading={loading}/>
    );
};

export default ChatScreen;