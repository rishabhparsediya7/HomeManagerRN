import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuthorizeNavigation } from "../../../navigators/navigators";
import { createInitialsForImage } from "../../../utils/users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredKeyPair } from "../../../utils/cryptoUtils";
import naclUtil from "tweetnacl-util";
import nacl from "tweetnacl";
import axios from 'axios';
import { useKeyboardStatus } from "../../../hooks/useKeyboardStatus";
import { useChatStore } from "../../../store";
import socket from "../../../utils/socket";

interface Message {
    id: number;
    message: string;
    nonce: string;
    plaintext?: string;
    receiver_id: string;
    sender_id: string | null;
    sent_at: string;
}

async function fetchAndDecryptChat(withUser: string) {

    try {
    const userId = await AsyncStorage.getItem('userId');
    console.log("🚀 ~ fetchAndDecryptChat ~ userId:", userId)

    const privateKey = await AsyncStorage.getItem('privateKey');
    console.log("🚀 ~ fetchAndDecryptChat ~ privateKey:", privateKey)
    const publicKey = await AsyncStorage.getItem('publicKey');
    console.log("🚀 ~ fetchAndDecryptChat ~ publicKey:", publicKey)

    if(!privateKey || !publicKey){
        throw new Error('Keypair not found');
    }
    
    const messages = await (await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/history?userId=${userId}&withUser=${withUser}`)).data;

    const resp = await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/get-user-keys/${withUser}`);
    console.log("🚀 ~ fetchAndDecryptChat ~ resp:", resp)
    const { publicKey: theirPubB64 } = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    const mySK = naclUtil.decodeBase64(privateKey);

    return messages.map((msg: Message) => {
        const plain = nacl.box.open(
            naclUtil.decodeBase64(msg.message),
            naclUtil.decodeBase64(msg.nonce),
            theirPub,
            mySK
        );

        return {
            ...msg,
            plaintext: plain ? naclUtil.encodeUTF8(plain) : '[These messages are from before you reinstalled the app and can no longer be decrypted]',
        };
    });
    } catch (error) {
        console.error("Failed to fetch and decrypt chat:", error);
        return [];
    }
}

const ListHeaderComponent = ({ navigation, firstName, lastName, image, profileImage }: any) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.canGoBack() && navigation.goBack()}>
                <EntypoIcon name="chevron-thin-left" size={28} style={styles.headerIcon} />
            </TouchableOpacity>
            {image ? <Image source={{ uri: image }} style={styles.headerImage} /> : <View style={styles.initialsContainer}><Text style={styles.initials}>{profileImage}</Text></View>}
            <Text style={styles.headerText}>{firstName + ' ' + lastName}</Text>
        </View>
    )
}

const FriendChatScreen = ({ route }) => {
    const { id, firstName, lastName, image } = route?.params;
    const [message, setMessage] = useState('');
    const navigation = useAuthorizeNavigation();
    const flatListRef = useRef<FlatList>(null);
    const [initialScrollDone, setInitialScrollDone] = useState(false);
    const [userId, setUserId] = useState<string | null>('');
    const [loading, setLoading] = useState(false);
    const isKeyboardVisible = useKeyboardStatus();
    const { chats, setMessages, addMessage } = useChatStore();
    console.log("🚀 ~ FriendChatScreen ~ chats:", chats)
    const messages = chats[id] || [];

    let profileImage = image;
    if (!image) {
        profileImage = createInitialsForImage(firstName + ' ' + lastName);
    }

    useEffect(() => {
        if (!userId) return;

        const handleReceiveMessage = async (payload: {
            senderId: string;
            message: string;
            nonce: string;
        }) => {
            console.log("📥 Received message:", payload);

            const pair = await getStoredKeyPair();
            if (!pair) throw new Error('Keypair not found');
            let mySK = pair?.secretKey;

            if(!mySK){
                mySK = naclUtil.decodeBase64(await String(await AsyncStorage.getItem('privateKey')));
            }

            if(!mySK){
                throw new Error('Secret key not found');
            }

            const resp = await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/get-user-keys/${payload.senderId}`);
            const { publicKey: theirPubB64 } = resp.data;
            const theirPub = naclUtil.decodeBase64(theirPubB64);

            const decrypted = nacl.box.open(
                naclUtil.decodeBase64(payload.message),
                naclUtil.decodeBase64(payload.nonce),
                theirPub,
                mySK
            );

            if (decrypted) {
                const plaintext = naclUtil.encodeUTF8(decrypted);
                const newMessage: Message = {
                    id: messages.length || 0 + 1, // generate unique id locally
                    message: payload.message,
                    nonce: payload.nonce,
                    plaintext,
                    receiver_id: userId,
                    sender_id: payload.senderId,
                    sent_at: new Date().toISOString(),
                };
                addMessage(id, newMessage);
            } else {
                console.warn("❌ Could not decrypt message");
            }
        };

        socket.on('receive-message', handleReceiveMessage);
        return () => socket.off('receive-message', handleReceiveMessage);

    }, [userId]);

    const sendMessage = async () => {
        if (message.trim() !== '' && userId) {
            addMessage(id, {
                id: messages.length || 0 + 1,
                message,
                nonce: naclUtil.encodeBase64(nacl.randomBytes(nacl.box.nonceLength)),
                receiver_id: id,
                sender_id: userId,
                sent_at: new Date().toISOString(),
                plaintext: message,
            });
            setMessage('');
            const pair = await getStoredKeyPair();
            if (!pair) throw new Error('Keypair not found');
            let mySK = pair?.secretKey;

            if(!mySK){
                mySK = naclUtil.decodeBase64(await String(await AsyncStorage.getItem('privateKey')));
            }

            if(!mySK){
                throw new Error('Secret key not found');
            }

            const resp = await axios.get(`https://0e622c717fbb.ngrok-free.app/api/chat/get-user-keys/${id}`);
            const { publicKey: theirPubB64 } = await resp.data;
            const theirPub = naclUtil.decodeBase64(theirPubB64);

            const nonce = nacl.randomBytes(nacl.box.nonceLength);
            const cipher = nacl.box(naclUtil.decodeUTF8(message), nonce, theirPub, mySK);

            socket.emit('send-message', {
                senderId: userId,
                receiverId: id,
                message: naclUtil.encodeBase64(cipher),
                nonce: naclUtil.encodeBase64(nonce),
            });
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }

    useEffect(() => {
        AsyncStorage.getItem('userId').then((userId) => {
            setUserId(userId);
        });

        const fetchChat = async () => {
            const chat = await fetchAndDecryptChat(id);
            console.log("🚀 ~ fetchChat ~ chat:", chat)
            setMessages(id, chat);
        };

        if (messages.length === 0) {
            fetchChat();
        }
    }, [userId]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : isKeyboardVisible ? 24 : 0}>
                <ListHeaderComponent navigation={navigation} firstName={firstName} lastName={lastName} image={image} profileImage={profileImage} />
                <FlatList
                    // ListHeaderComponent={() => <ListHeaderComponent navigation={navigation} firstName={firstName} lastName={lastName} image={image} profileImage={profileImage} />}
                    data={messages}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageContainer,
                            item.sender_id === userId && styles.messageContainerSender
                        ]}>
                            <View style={item.sender_id === userId ? styles.sender : styles.receiver}>
                                <Text style={[styles.messageText, item.sender_id === userId && styles.messageTextSender]}>{item.sender_id === userId ? 'You: ' : firstName + ' ' + lastName + ': '}{item.plaintext}</Text>
                                <Text style={[styles.messageTime, item.sender_id === userId && styles.messageTimeSender]}>{new Date(item.sent_at).toLocaleTimeString().split(':')[0].slice(0, 2) + ':' + new Date(item.sent_at).toLocaleTimeString().split(':')[1].slice(0, 2)}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => new Date(item.sent_at).getTime().toString()}
                    ref={flatListRef}
                    onLayout={() => {
                        if (!initialScrollDone) {
                            flatListRef.current?.scrollToEnd({ animated: false }); // Instant jump
                            setInitialScrollDone(true);
                        }
                    }}
                    onContentSizeChange={() => {
                        if (initialScrollDone) {
                            flatListRef.current?.scrollToEnd({ animated: true }); // Smooth scroll for new message
                        }
                    }}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={message}
                        multiline
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Icon name="send" size={24} style={styles.sendIcon} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default FriendChatScreen;

const styles = StyleSheet.create({
    headerIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F5F6FA',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    contentContainer: {
        flexGrow: 1,
        width: '100%',
    },
    headerImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginLeft: -12,
    },
    headerIcon: {
        color: '#333',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'semibold',
        color: '#333',
    },
    messageContainer: {
        width: '100%',
        alignItems: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    messageContainerSender: {
        alignItems: 'flex-end',
        width: '100%'
    },
    messageText: {
        fontSize: 18,
    },
    messageTextSender: {
        color: '#fff',
    },
    messageTime: {
        fontSize: 14,
        color: '#666',
    },
    messageTimeSender: {
        color: '#fff',
    },
    sender: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 10,
        maxWidth: '70%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        flexWrap: 'wrap',
    },
    receiver: {
        backgroundColor: '#F5F6FA',
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        flexWrap: 'wrap',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F5F6FA',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        minHeight: 40,
        maxHeight: 120,
    },
    sendButton: {
        padding: 12,
    },
    sendIcon: {
        color: '#333',
    },
    initialsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        marginLeft: -12,
    },
    initials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
