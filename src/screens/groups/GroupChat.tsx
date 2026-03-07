import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import AppText from '../../components/common/AppText';
import PremiumGate from '../../components/premiumGate/PremiumGate';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {useAuth} from '../../providers/AuthProvider';
import groupApi, {GroupMessage} from '../../services/groupApi';
import socket from '../../utils/socket';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

interface GroupChatProps {
  groupId?: string;
  groupName?: string;
  isEmbedded?: boolean;
}

const GroupChat = ({
  groupId: propsGroupId,
  groupName: propsGroupName,
  isEmbedded = false,
}: GroupChatProps) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {user: authUser} = useAuth();

  const groupId = propsGroupId || route.params?.groupId;
  const groupName = propsGroupName || route.params?.groupName || 'Group Chat';

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false); // TODO: pull from auth context
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!groupId) return;
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
      if (!groupId) return;
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
    if (!messageText.trim() || !groupId) return;

    socket.emit('send-group-message', {
      groupId,
      senderId: authUser?.userId,
      message: messageText.trim(),
    });

    setMessageText('');
  };

  const isSystemMessage = (type: string) =>
    ['expense_deleted', 'settlement', 'member_joined', 'member_left'].includes(
      type,
    );

  const renderExpenseCard = (item: GroupMessage) => {
    const isMe = item.senderId === authUser?.userId;
    const metadata = item.metadata || {};

    return (
      <View
        style={[
          styles.expenseCardContainer,
          isMe ? styles.myExpenseContainer : styles.otherExpenseContainer,
        ]}>
        {!isMe && (
          <AppText
            variant="sm"
            weight="semiBold"
            style={[
              styles.senderLabel,
              {color: colors.primary, marginBottom: 4},
            ]}>
            {item.senderName}
          </AppText>
        )}
        <TouchableOpacity
          style={[
            styles.expenseCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.9}
          onPress={() => {
            if (metadata.splitExpenseId) {
              // Navigation to expense detail could go here
            }
          }}>
          <View style={styles.expenseCardHeader}>
            <View
              style={[
                styles.expenseIconContainer,
                {backgroundColor: colors.primary + '15'},
              ]}>
              <Icon name="receipt" size={20} color={colors.primary} />
            </View>
            <View style={styles.expenseCardInfo}>
              <AppText variant="md" weight="semiBold" numberOfLines={1}>
                {metadata.description || 'Expense Added'}
              </AppText>
              <AppText variant="sm" style={{color: colors.mutedText}}>
                {isMe
                  ? 'You added an expense'
                  : `${item.senderName} added an expense`}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.expenseCardDivider,
              {backgroundColor: colors.border},
            ]}
          />

          <View style={styles.expenseCardBody}>
            <View>
              <AppText
                variant="caption"
                style={{color: colors.mutedText, textTransform: 'uppercase'}}>
                Amount
              </AppText>
              <AppText variant="lg" weight="bold" style={{color: colors.text}}>
                ₹{parseFloat(metadata.amount || '0').toFixed(2)}
              </AppText>
            </View>
            <TouchableOpacity
              style={[
                styles.viewDetailsBtn,
                {backgroundColor: colors.primary},
              ]}>
              <AppText variant="sm" weight="semiBold" style={{color: '#FFF'}}>
                Details
              </AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <AppText
          variant="caption"
          style={[
            styles.timestamp,
            {
              color: colors.mutedText,
              marginTop: 4,
              alignSelf: isMe ? 'flex-end' : 'flex-start',
            },
          ]}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
      </View>
    );
  };

  const renderMessage = ({item}: {item: GroupMessage}) => {
    const isMe = item.senderId === authUser?.userId;
    const isSystem = isSystemMessage(item.messageType);
    const isExpense = item.messageType === 'expense_added';

    if (isExpense) {
      return renderExpenseCard(item);
    }

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View
            style={[styles.systemMessage, {backgroundColor: colors.surface}]}>
            <AppText
              variant="sm"
              style={{color: colors.mutedText, textAlign: 'center'}}>
              {item.message}
            </AppText>
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
          <AppText
            variant="sm"
            weight="semiBold"
            style={[styles.senderLabel, {color: colors.primary}]}>
            {item.senderName}
          </AppText>
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
          <AppText
            variant="md"
            style={{color: isMe ? colors.senderText : colors.receiverText}}>
            {item.message}
          </AppText>
        </View>
        <AppText
          variant="caption"
          style={[styles.timestamp, {color: colors.mutedText}]}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
      </View>
    );
  };

  if (loading && !isEmbedded) {
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
      {!isEmbedded && <Header title={groupName} showBackButton />}

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
            <Icon name="chat-outline" size={44} color={colors.mutedText} />
            <AppText variant="md" style={{color: colors.mutedText}}>
              No messages yet
            </AppText>
          </View>
        }
      />

      {/* Chat Input — Premium-gated */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={isEmbedded ? 100 : 0}>
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
    gap: 12,
    flexGrow: 1,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  systemMessage: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '85%',
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    gap: 4,
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
    marginLeft: 8,
    marginBottom: 2,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  otherMessageContainerBubble: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  timestamp: {
    marginHorizontal: 6,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 80,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  // Expense Card Styles
  expenseCardContainer: {
    width: '85%',
    marginVertical: 4,
  },
  myExpenseContainer: {
    alignSelf: 'flex-end',
  },
  otherExpenseContainer: {
    alignSelf: 'flex-start',
  },
  expenseCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  expenseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseCardInfo: {
    flex: 1,
    gap: 2,
  },
  expenseCardDivider: {
    height: 1,
    marginVertical: 12,
  },
  expenseCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetailsBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});

export default GroupChat;
