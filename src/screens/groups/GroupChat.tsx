import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import PremiumGate from '../../components/premiumGate/PremiumGate';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import groupApi, {GroupMessage} from '../../services/groupApi';
import socket from '../../utils/socket';
import {useRoute, useFocusEffect} from '@react-navigation/native';

const GroupChat = () => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const route = useRoute<any>();
  const {user: authUser} = useAuth();
  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName || 'Group Chat';

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false); // TODO: pull from auth context
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const res = await groupApi.getGroupMessages(groupId);
      if (res.data?.success) {
        setMessages((res.data.data || []).reverse());
      }
    } catch (err) {
      console.error('Failed to fetch group messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();

      // Join group room
      socket.emit('join-group', groupId);

      // Listen for new messages
      const handleNewMessage = (msg: any) => {
        if (msg.groupId === groupId) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('receive-group-message', handleNewMessage);

      return () => {
        socket.off('receive-group-message', handleNewMessage);
      };
    }, [groupId]),
  );

  const sendMessage = () => {
    if (!messageText.trim()) return;

    socket.emit('send-group-message', {
      groupId,
      senderId: authUser?.userId,
      message: messageText.trim(),
    });

    setMessageText('');
  };

  const isSystemMessage = (type: string) =>
    [
      'expense_added',
      'expense_deleted',
      'settlement',
      'member_joined',
      'member_left',
    ].includes(type);

  const renderMessage = ({item}: {item: GroupMessage}) => {
    const isMe = item.senderId === authUser?.userId;
    const isSystem = isSystemMessage(item.messageType);

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View
            style={[styles.systemMessage, {backgroundColor: colors.surface}]}>
            <Text style={[styles.systemMessageText, {color: colors.mutedText}]}>
              {item.message}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}>
        {!isMe && (
          <Text style={[styles.senderLabel, {color: colors.primary}]}>
            {item.senderName}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe
                ? colors.senderBackground
                : colors.receiverBackground,
            },
          ]}>
          <Text
            style={[
              styles.messageText,
              {color: isMe ? colors.senderText : colors.receiverText},
            ]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, {color: colors.mutedText}]}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, {backgroundColor: colors.background}]}>
        <Header title={groupName} showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <Header title={groupName} showBackButton />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: false})
        }
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Icon name="chat-outline" size={40} color={colors.mutedText} />
            <Text style={{color: colors.mutedText, fontSize: 14}}>
              No messages yet
            </Text>
          </View>
        }
      />

      {/* Chat Input — Premium-gated */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <PremiumGate
          isPremium={isPremium}
          colors={colors}
          featureName="Group Chat">
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}>
            <TextInput
              style={[
                styles.chatInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  borderColor: colors.inputBorder,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.placeholder}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: messageText.trim()
                    ? colors.primary
                    : colors.primary + '40',
                },
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim()}>
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </PremiumGate>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    gap: 8,
    flexGrow: 1,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemMessage: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '80%',
  },
  systemMessageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    gap: 2,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 60,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GroupChat;
