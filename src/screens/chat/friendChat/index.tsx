import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/FontAwesome';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import Button from '../../../components/Button';
import AppInput from '../../../components/common/AppInput';
import AppText from '../../../components/common/AppText';
import {useAuthorizeNavigation} from '../../../navigators/navigators';
import {darkTheme, lightTheme} from '../../../providers/Theme';
import {useTheme} from '../../../providers/ThemeContext';
import api from '../../../services/api';
import {useChatStore} from '../../../store';
import {getStoredKeyPair} from '../../../utils/cryptoUtils';
import socket from '../../../utils/socket';
import {commonStyles} from '../../../utils/styles';
import {createInitialsForImage} from '../../../utils/users';

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

async function fetchAndDecryptChat(
  withUser: string,
  before?: string,
): Promise<{messages: Message[]; hasMore: boolean}> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const privateKey = await AsyncStorage.getItem('privateKey');
    const publicKey = await AsyncStorage.getItem('publicKey');

    if (!privateKey || !publicKey) {
      throw new Error('Keypair not found');
    }

    let url = `/api/chat/history?userId=${userId}&withUser=${withUser}&limit=50`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }

    const response = await api.get(url);
    const {messages: rawMessages, hasMore} = response.data;

    const resp = await api.get(`/api/chat/get-user-keys/${withUser}`);
    const {publicKey: theirPubB64} = resp.data;
    const theirPub = naclUtil.decodeBase64(theirPubB64);

    const mySK = naclUtil.decodeBase64(privateKey);

    const decryptedMessages = (rawMessages || []).map((msg: any) => {
      const plain = nacl.box.open(
        naclUtil.decodeBase64(msg.message),
        naclUtil.decodeBase64(msg.nonce),
        theirPub,
        mySK,
      );

      return {
        id: msg.id,
        message: msg.message,
        nonce: msg.nonce,
        sender_id: msg.sender_id || msg.senderId,
        receiver_id: msg.receiver_id || msg.receiverId,
        sent_at: msg.sent_at || msg.sentAt,
        plaintext: plain
          ? naclUtil.encodeUTF8(plain)
          : '[These messages are from before you reinstalled the app and can no longer be decrypted]',
      };
    });

    return {messages: decryptedMessages, hasMore};
  } catch (error) {
    console.error('Failed to fetch and decrypt chat:', error);
    return {messages: [], hasMore: false};
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
  const {chats, setMessages, addMessage, prependMessages} = useChatStore();
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const messages = chats[id] || [];
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

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
      try {
        // Only handle messages from the friend we're chatting with
        if (payload.senderId !== id) {
          // Message is from another friend — store it for their chat
          // but don't process here
          return;
        }

        const pair = await getStoredKeyPair();
        let mySK = pair?.secretKey;

        if (!mySK) {
          const storedKey = await AsyncStorage.getItem('privateKey');
          if (storedKey) {
            mySK = naclUtil.decodeBase64(storedKey);
          }
        }

        if (!mySK) {
          console.error('❌ Secret key not found, cannot decrypt message');
          return;
        }

        const resp = await api.get(
          `/api/chat/get-user-keys/${payload.senderId}`,
        );
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
            id: Date.now(),
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
      } catch (error) {
        console.error('❌ Error handling received message:', error);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [userId, id]);

  const sendMessage = async () => {
    if (message.trim() !== '' && userId) {
      const messageText = message;
      addMessage(id, {
        id: Date.now(),
        message: messageText,
        nonce: naclUtil.encodeBase64(nacl.randomBytes(nacl.box.nonceLength)),
        receiver_id: id,
        sender_id: userId,
        sent_at: new Date().toISOString(),
        plaintext: messageText,
      });
      setMessage('');

      try {
        const pair = await getStoredKeyPair();
        let mySK = pair?.secretKey;

        if (!mySK) {
          const storedKey = await AsyncStorage.getItem('privateKey');
          if (storedKey) {
            mySK = naclUtil.decodeBase64(storedKey);
          }
        }

        if (!mySK) {
          console.error('❌ No secret key found, cannot send message');
          return;
        }

        const resp = await api.get(`/api/chat/get-user-keys/${id}`);
        const {publicKey: theirPubB64} = resp.data;

        if (!theirPubB64) {
          console.error('❌ No public key found for receiver', id);
          return;
        }

        const theirPub = naclUtil.decodeBase64(theirPubB64);

        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const cipher = nacl.box(
          naclUtil.decodeUTF8(messageText),
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
      } catch (error) {
        console.error('❌ Failed to send message:', error);
      }
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('userId').then(uid => {
      setUserId(uid);
    });
  }, []);

  // Always fetch fresh chat history on screen mount to load offline/missed messages
  useEffect(() => {
    const fetchChat = async () => {
      // Only show loading spinner if there are no cached messages
      if (messages.length === 0) {
        setLoading(true);
      }
      try {
        const {messages: chat, hasMore: more} = await fetchAndDecryptChat(id);
        setMessages(id, chat);
        setHasMore(more);
      } catch (error) {
        console.error('Failed to fetch chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  // Load older messages when user scrolls to top
  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore || messages.length === 0) return;

    setLoadingOlder(true);
    try {
      const oldestMessage = messages[0];
      const {messages: olderMsgs, hasMore: more} = await fetchAndDecryptChat(
        id,
        oldestMessage.sent_at,
      );
      if (olderMsgs.length > 0) {
        prependMessages(id, olderMsgs);
      }
      setHasMore(more);
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  };

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
                      {(() => {
                        const date = new Date(item.sent_at);
                        if (isNaN(date.getTime())) return '';
                        return date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        });
                      })()}
                    </AppText>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) =>
                `${item.sent_at}-${item.id}-${index}`
              }
              ref={flatListRef}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                loadingOlder ? (
                  <View
                    style={{
                      padding: 12,
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
              onScroll={({nativeEvent}) => {
                // Trigger load older messages when scrolled near the top
                if (
                  nativeEvent.contentOffset.y < 100 &&
                  hasMore &&
                  !loadingOlder
                ) {
                  loadOlderMessages();
                }
              }}
              scrollEventThrottle={400}
              ListFooterComponent={<View style={{height: 16}} />}
              onContentSizeChange={() => {
                if (!loadingOlder) {
                  // Always scroll to end for initial load and new messages
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({
                      animated: initialScrollDone,
                    });
                    if (!initialScrollDone) {
                      setInitialScrollDone(true);
                    }
                  }, 100);
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
