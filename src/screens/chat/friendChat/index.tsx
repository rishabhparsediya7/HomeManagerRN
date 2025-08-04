import { useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuthorizeNavigation } from "../../../navigators/navigators";
import { createInitialsForImage } from "../../../utils/users";

const FriendChatScreen = ({ route }) => {

    const { id, firstName, lastName, image } = route?.params;
    const [message, setMessage] = useState('');
    const navigation = useAuthorizeNavigation();
    const flatListRef= useRef<FlatList>(null);
    const [initialScrollDone, setInitialScrollDone] = useState(false);
    let profileImage = image;
    if (!image) {
        profileImage = createInitialsForImage(firstName + ' ' + lastName);
    }    

    const messages = [
        {
            id: 1,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 2,
            message: 'Hello, I am fine, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 3,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 4,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 1,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 2,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 3,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 4,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 1,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 2,
            message: 'Hello, I am fine, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 3,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 4,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 1,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
        {
            id: 2,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 3,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 1,
        },
        {
            id: 4,
            message: 'Hello, how are you?',
            timestamp: '2022-01-01T00:00:00Z',
            senderId: 2,
        },
    ]

    const sendMessage = () => {
        if (message.trim() !== '') {
            messages.push({
                id: messages.length + 1,
                message,
                timestamp: new Date().toISOString(),
                senderId: 2,
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
                    data={messages}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageContainer,
                            item.senderId === id && styles.messageContainerSender
                        ]}>
                            <View style={item.senderId === id ? styles.sender : styles.receiver  }>
                                <Text style={[styles.messageText, item.senderId === id && styles.messageTextSender]}>{item.senderId === id ? 'You: ' : firstName + ' ' + lastName + ': '}{item.message}</Text>
                                <Text style={[styles.messageTime, item.senderId === id && styles.messageTimeSender]}>{new Date(item.timestamp).toLocaleTimeString().split(':')[0].slice(0, 2) + ':' + new Date(item.timestamp).toLocaleTimeString().split(':')[1].slice(0, 2)}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()+item.senderId.toString()+item.timestamp.toString()+ Math.floor(Math.random() * 1000000).toString()}
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
