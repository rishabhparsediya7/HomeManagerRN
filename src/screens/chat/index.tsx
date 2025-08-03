import 'react-native-get-random-values'; // 👈 MUST BE FIRST

import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { getStoredKeyPair, generateAndStoreKeyPair, resetKeyPair } from '../../utils/cryptoUtils';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import api from '../../services/api';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FriendsScreen from './friends';

const userIds = ['e0e85d63-fab2-4f16-b55d-7a3439f0494c', '62292c6a-8a7a-457c-ad02-2fea0023f6a1'];
async function initKeys() {
    try {
        const pair = await getStoredKeyPair();
        if (pair) return;
        const publicKeyB64 = await generateAndStoreKeyPair();
        const userId = await AsyncStorage.getItem('userId');
        const response = await api.post('/api/chat/upload-key', {
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

// Send encrypted message
async function sendMessage(toId: string, plaintext: string) {
    const userId = await AsyncStorage.getItem('userId');
    const pair = await getStoredKeyPair();
    if (!pair) throw new Error('Keypair not found');
    const { secretKey: mySK } = pair;

    const resp = await api.get(`/api/chat/public-key/${toId}`);
    const { publicKey: theirPubB64 } = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const cipher = nacl.box(naclUtil.decodeUTF8(plaintext), nonce, theirPub, mySK);

    await api.post('api/chat/message', {
        senderId: userId,
        receiverId: toId,
        message: naclUtil.encodeBase64(cipher),
        nonce: naclUtil.encodeBase64(nonce),
    });
}

// Fetch chat and decrypt
async function fetchAndDecryptChat(withUser: string) {
    const userId = await AsyncStorage.getItem('userId');
    const pair = await getStoredKeyPair();
    if (!pair) throw new Error('Keypair not found');
    const { secretKey: mySK } = pair;

    const messages = await (await api.get(`/api/chat/history?userId=${userId}&withUser=${withUser}`)).data;

    const resp = await api.get(`/api/chat/public-key/${withUser}`);
    const { publicKey: theirPubB64 } = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    return messages.map((msg: any) => {
        const plain = nacl.box.open(
            naclUtil.decodeBase64(msg.message),
            naclUtil.decodeBase64(msg.nonce),
            theirPub,
            mySK
        );

        return {
            ...msg,
            plaintext: plain ? naclUtil.encodeUTF8(plain) : '[decryption failed]',
        };
    });
}

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [toggler, setToggler] = useState(true);
    const withUserId = toggler ? userIds[0] : userIds[1];
    const [chat, setChat] = useState([
        {
            senderId: 'alice',
            receiverId: 'bob',
            message: '2Qd1tPvYHf0It1q+xh4ZMC+yLphG7E3zXZ5ud9fvCis=',
            nonce: 'sB6K9MHDqDZJcpR2bNPb7dGxHfMndAId',
            timestamp: '2025-08-03T12:34:56Z',
            plaintext: 'Hey, how are you?'
        },
        {
            senderId: 'bob',
            receiverId: 'alice',
            message: '2Qd1tPvYHf0It1q+xh4ZMC+yLphG7E3zXZ5ud9fvCis=',
            nonce: 'sB6K9MHDqDZJcpR2bNPb7dGxHfMndAId',
            timestamp: '2025-08-03T12:34:56Z',
            plaintext: 'I am good'
        }
    ]
    );

    useEffect(() => {
        // initKeys();
        // const fetchChat = async () => {
        //     const chat = await fetchAndDecryptChat(withUserId);
        //     setChat(chat);
        // };
        // fetchChat();
    }, []);

    return (
      <FriendsScreen/>
    );
};

export default ChatScreen;

{/* <View>
<Text>Chat Screen</Text>
<Button title="Toggle" onPress={() => setToggler(!toggler)} />
<View style={{ flexDirection: 'row' }}>
    <TextInput placeholder="Enter message" value={message} onChangeText={setMessage} />
    <Button title="Send" onPress={() => sendMessage(withUserId, message)} />
</View>
<FlatList
    data={chat}
    renderItem={({ item }) => <Text>{item.plaintext}</Text>}
/>
</View> */}