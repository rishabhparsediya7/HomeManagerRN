import { useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuthorizeNavigation } from "../../../navigators/navigators";
import { createInitialsForImage } from "../../../utils/users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredKeyPair } from "../../../utils/cryptoUtils";
import naclUtil from "tweetnacl-util";
import nacl from "tweetnacl";
import axios from 'axios';

interface Message {
    id: number;
    message: string;
    nonce: string;
    plaintext?: string;
    receiver_id: string;
    sender_id: string | null;
    sent_at: string;
}

async function sendMessage(toId: string, plaintext: string) {
    const userId = await AsyncStorage.getItem('userId');
    const pair = await getStoredKeyPair();
    if (!pair) throw new Error('Keypair not found');
    const { secretKey: mySK } = pair;

    const resp = await axios.get(`https://1222457b3111.ngrok-free.app/api/chat/public-key/${toId}`);
    const { publicKey: theirPubB64 } = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const cipher = nacl.box(naclUtil.decodeUTF8(plaintext), nonce, theirPub, mySK);

    await axios.post('https://1222457b3111.ngrok-free.app/api/chat/message', {
        senderId: userId,
        receiverId: toId,
        message: naclUtil.encodeBase64(cipher),
        nonce: naclUtil.encodeBase64(nonce),
    });
}


async function fetchAndDecryptChat(withUser: string) {
    const userId = await AsyncStorage.getItem('userId');
    const pair = await getStoredKeyPair();
    if (!pair) throw new Error('Keypair not found');
    const { secretKey: mySK } = pair;

    const messages = await (await axios.get(`https://1222457b3111.ngrok-free.app/api/chat/history?userId=${userId}&withUser=${withUser}`)).data;

    const resp = await axios.get(`https://1222457b3111.ngrok-free.app/api/chat/public-key/${withUser}`);
    const { publicKey: theirPubB64 } = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);
    

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
}

const FriendChatScreen = ({ route }) => {
    const { id, firstName, lastName, image } = route?.params;
    const [message, setMessage] = useState('');
    const navigation = useAuthorizeNavigation();
    const flatListRef= useRef<FlatList>(null);
    const [initialScrollDone, setInitialScrollDone] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>('');
    const [loading, setLoading] = useState(false);
    let profileImage = image;
    if (!image) {
        profileImage = createInitialsForImage(firstName + ' ' + lastName);
    }    

    useEffect(() => {
        const fetchChat = async () => {
            const userId = await AsyncStorage.getItem('userId');
            setUserId(userId);
            setLoading(true);
            try {
                const chat = await fetchAndDecryptChat(id);
                setChatMessages(chat);
            } catch (error) {
                console.error('Failed to fetch chat:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchChat();
    }, []);

    const sendMessage = () => {
        if (message.trim() !== '' && userId) {
            chatMessages.push({
                id: chatMessages.length + 1,
                message,
                nonce: naclUtil.encodeBase64(nacl.randomBytes(nacl.box.nonceLength)),
                receiver_id: id,
                sender_id: userId,
                sent_at: new Date().toISOString(),
            });
            setMessage('');
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.canGoBack() && navigation.goBack()}>
                    <EntypoIcon name="chevron-thin-left" size={28} style={styles.headerIcon} />
                </TouchableOpacity>
                {image ? <Image source={{ uri: image }} style={styles.headerImage} /> : <View style={styles.initialsContainer}><Text style={styles.initials}>{profileImage}</Text></View>}
                <Text style={styles.headerText}>{firstName + ' ' + lastName}</Text>
            </View>
            <View style={styles.content}>
                <FlatList
                    data={chatMessages}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageContainer,
                            item.sender_id === id && styles.messageContainerSender
                        ]}>
                            <View style={item.sender_id === id ? styles.sender : styles.receiver  }>
                                <Text style={[styles.messageText, item.sender_id === id && styles.messageTextSender]}>{item.sender_id === id ? 'You: ' : firstName + ' ' + lastName + ': '}{item.plaintext}</Text>
                                <Text style={[styles.messageTime, item.sender_id === id && styles.messageTimeSender]}>{new Date(item.sent_at).toLocaleTimeString().split(':')[0].slice(0, 2) + ':' + new Date(item.sent_at).toLocaleTimeString().split(':')[1].slice(0, 2)}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
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
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Icon name="send" size={24} style={styles.sendIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FriendChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        width:'100%',
    },
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
        paddingVertical: 12,
        paddingHorizontal: 12,
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
    content: {
        width: '100%',
        flex: 1,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'semibold',
        color: '#333',
    },
    contentText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    messageContainer: {
        width: '100%',
        marginVertical: 4,
        alignItems: 'flex-start',
    },
    messageContainerSender: {
        alignItems: 'flex-end',
        width:'100%'
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
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        gap:6,
        flexWrap:'wrap',
    },
    receiver: {
        backgroundColor: '#F5F6FA',
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        width:'100%',
        maxWidth: '70%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        gap:6,
        flexWrap:'wrap',
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
