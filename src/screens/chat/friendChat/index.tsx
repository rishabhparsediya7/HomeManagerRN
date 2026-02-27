import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppText from '../../../components/common/AppText';
import AppInput from '../../../components/common/AppInput';
import Button from '../../../components/Button';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useAuthorizeNavigation} from '../../../navigators/navigators';
import {createInitialsForImage} from '../../../utils/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStoredKeyPair} from '../../../utils/cryptoUtils';
import naclUtil from 'tweetnacl-util';
import nacl from 'tweetnacl';
import api from '../../../services/api';
import {useChatStore} from '../../../store';
import socket from '../../../utils/socket';
import {useTheme} from '../../../providers/ThemeContext';
import {lightTheme, darkTheme} from '../../../providers/Theme';
import {commonStyles} from '../../../utils/styles';

interface Message {
  id: number;
  message: string;
  nonce: string;
  plaintext?: string;
  receiver_id: string;
  sender_id: string | null;
  sent_at: string;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 18,
      ...commonStyles.textDefault,
      color: colors.inputText,
    },
    headerIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      padding: 8,
    },
    headerInfoGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contentContainer: {
      flexGrow: 1,
      width: '100%',
    },
    headerImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    headerIcon: {
      color: colors.text,
    },
    headerText: {
      fontSize: 18,
      color: colors.text,
      ...commonStyles.textDefault,
      marginLeft: 4,
    },
    messageContainer: {
      width: '100%',
      alignItems: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    messageContainerSender: {
      alignItems: 'flex-end',
      width: '100%',
    },
    messageText: {
      fontSize: 18,
      ...commonStyles.textDefault,
    },
    messageTextSender: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    messageTime: {
      fontSize: 14,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    messageTimeSender: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
    },
    sender: {
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 10,
      maxWidth: '70%',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 6,
      flexWrap: 'wrap',
    },
    receiver: {
      backgroundColor: colors.receiverBackground,
      padding: 10,
      borderRadius: 10,
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: '70%',
      flexDirection: 'row',
      alignItems: 'flex-end',
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
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
    },
    sendButton: {
      padding: 4,
    },
    sendIcon: {
      color: colors.text,
    },
    initialsContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonText,
      padding: 8,
    },
    initials: {
      color: 'white',
    },
    messageTextReceiver: {
      color: colors.receiverText,
      ...commonStyles.textDefault,
    },
    messageTimeReceiver: {
      color: colors.receiverText,
      ...commonStyles.textDefault,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
  });

async function fetchAndDecryptChat(withUser: string) {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const privateKey = await AsyncStorage.getItem('privateKey');
    const publicKey = await AsyncStorage.getItem('publicKey');

    if (!privateKey || !publicKey) {
      throw new Error('Keypair not found');
    }

    const messages = await (
      await api.get(`/api/chat/history?userId=${userId}&withUser=${withUser}`)
    ).data;

    const resp = await api.get(`/api/chat/get-user-keys/${withUser}`);
    const {publicKey: theirPubB64} = await resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    const mySK = naclUtil.decodeBase64(privateKey);

    return messages.map((msg: Message) => {
      const plain = nacl.box.open(
        naclUtil.decodeBase64(msg.message),
        naclUtil.decodeBase64(msg.nonce),
        theirPub,
        mySK,
      );

      return {
        ...msg,
        plaintext: plain
          ? naclUtil.encodeUTF8(plain)
          : '[These messages are from before you reinstalled the app and can no longer be decrypted]',
      };
    });
  } catch (error) {
    console.error('Failed to fetch and decrypt chat:', error);
    return [];
  }
}

const ChatAvatar = ({image, profileImage, styles}: any) => {
  if (image) {
    return <Image source={{uri: image}} style={styles.headerImage} />;
  }
  return (
    <View style={styles.initialsContainer}>
      <AppText variant="lg" style={styles.initials}>
        {profileImage}
      </AppText>
    </View>
  );
};

const ListHeaderComponent = ({
  navigation,
  firstName,
  lastName,
  image,
  profileImage,
  styles,
}: any) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerInfoGroup}
        onPress={() => navigation.canGoBack() && navigation.goBack()}>
        <EntypoIcon
          name="chevron-thin-left"
          size={20}
          style={styles.headerIcon}
        />
        <ChatAvatar image={image} profileImage={profileImage} styles={styles} />
      </TouchableOpacity>
      <AppText variant="h6" style={styles.headerText}>
        {firstName + ' ' + lastName}
      </AppText>
    </View>
  );
};

const LoadingComponent = ({styles, colors}: {styles: any; colors: any}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText style={styles.loadingText}>Loading messages...</AppText>
    </View>
  );
};

const FriendChatScreen = ({route}) => {
  const {id, firstName, lastName, image} = route?.params;
  const [message, setMessage] = useState('');
  const navigation = useAuthorizeNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [userId, setUserId] = useState<string | null>('');
  const [loading, setLoading] = useState(false);
  const {chats, setMessages, addMessage} = useChatStore();
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = React.useMemo(() => createStyles(colors), [colors]);

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
      const pair = await getStoredKeyPair();
      if (!pair) throw new Error('Keypair not found');
      let mySK = pair?.secretKey;

      if (!mySK) {
        mySK = naclUtil.decodeBase64(
          await String(await AsyncStorage.getItem('privateKey')),
        );
      }

      if (!mySK) {
        throw new Error('Secret key not found');
      }

      const resp = await api.get(`/api/chat/get-user-keys/${payload.senderId}`);
      const {publicKey: theirPubB64} = resp.data;
      const theirPub = naclUtil.decodeBase64(theirPubB64);

      const decrypted = nacl.box.open(
        naclUtil.decodeBase64(payload.message),
        naclUtil.decodeBase64(payload.nonce),
        theirPub,
        mySK,
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
        console.warn('❌ Could not decrypt message');
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
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

      if (!mySK) {
        mySK = naclUtil.decodeBase64(
          await String(await AsyncStorage.getItem('privateKey')),
        );
      }

      if (!mySK) {
        throw new Error('Secret key not found');
      }

      const resp = await api.get(`/api/chat/get-user-keys/${id}`);
      const {publicKey: theirPubB64} = await resp.data;
      const theirPub = naclUtil.decodeBase64(theirPubB64);

      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const cipher = nacl.box(
        naclUtil.decodeUTF8(message),
        nonce,
        theirPub,
        mySK,
      );

      socket.emit('send-message', {
        senderId: userId,
        receiverId: id,
        message: naclUtil.encodeBase64(cipher),
        nonce: naclUtil.encodeBase64(nonce),
      });
      flatListRef.current?.scrollToEnd({animated: true});
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('userId').then(userId => {
      setUserId(userId);
    });

    const fetchChat = async () => {
      setLoading(true);
      try {
        const chat = await fetchAndDecryptChat(id);
        setMessages(id, chat);
      } catch (error) {
        console.error('Failed to fetch chat:', error);
      } finally {
        setLoading(false);
      }
    };

    if (messages.length === 0) {
      fetchChat();
    }
  }, [userId]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ListHeaderComponent
          navigation={navigation}
          firstName={firstName}
          lastName={lastName}
          image={image}
          profileImage={profileImage}
          styles={styles}
        />
        <View style={{flex: 1}}>
          {loading ? (
            <LoadingComponent styles={styles} colors={colors} />
          ) : (
            <FlatList
              data={messages}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <View
                  style={[
                    styles.messageContainer,
                    item.sender_id === userId && styles.messageContainerSender,
                  ]}>
                  <View
                    style={
                      item.sender_id === userId
                        ? styles.sender
                        : styles.receiver
                    }>
                    <AppText
                      style={[
                        styles.messageText,
                        item.sender_id === userId
                          ? styles.messageTextSender
                          : styles.messageTextReceiver,
                      ]}>
                      {item.sender_id === userId
                        ? 'You: '
                        : firstName + ' ' + lastName + ': '}
                      {item.plaintext}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={[
                        styles.messageTime,
                        item.sender_id === userId
                          ? styles.messageTimeSender
                          : styles.messageTimeReceiver,
                      ]}>
                      {new Date(item.sent_at)
                        .toLocaleTimeString()
                        .split(':')[0]
                        .slice(0, 2) +
                        ':' +
                        new Date(item.sent_at)
                          .toLocaleTimeString()
                          .split(':')[1]
                          .slice(0, 2)}
                    </AppText>
                  </View>
                </View>
              )}
              keyExtractor={item => new Date(item.sent_at).getTime().toString()}
              ref={flatListRef}
              keyboardShouldPersistTaps="handled"
              onLayout={() => {
                if (!initialScrollDone) {
                  flatListRef.current?.scrollToEnd({animated: false}); // Instant jump
                  setInitialScrollDone(true);
                }
              }}
              onContentSizeChange={() => {
                if (initialScrollDone) {
                  flatListRef.current?.scrollToEnd({animated: true}); // Smooth scroll for new message
                }
              }}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <AppInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            multiline
            onChangeText={setMessage}
            placeholderTextColor={colors.inputText}
            containerStyle={{flex: 1, marginBottom: 0}}
          />
          <Button
            variant="ghost"
            onPress={sendMessage}
            style={{padding: 4}}
            icon={<Icon name="send" size={24} color={colors.primary} />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FriendChatScreen;
