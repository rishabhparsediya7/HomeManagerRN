import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_CACHED_MESSAGES = 50;

export type Message = {
  id: number;
  sender_id: string | null;
  receiver_id: string;
  message: string;
  nonce: string;
  sent_at: string;
  plaintext?: string;
  // Support for camelCase from backend
  senderId?: string | null;
  receiverId?: string;
  sentAt?: string;
};

type ChatState = {
  chats: Record<string, Message[]>;
  lastMessages: Record<string, string>;
  setMessages: (friendId: string, messages: Message[]) => void;
  addMessage: (friendId: string, message: Message) => void;
  prependMessages: (friendId: string, messages: Message[]) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      chats: {},
      lastMessages: {},
      setMessages: (friendId: string, messages: Message[]) =>
        set(state => ({
          chats: {
            ...state.chats,
            // Only cache the last N messages per friend
            [friendId]: messages.slice(-MAX_CACHED_MESSAGES),
          },
        })),

      addMessage: (friendId: string, message: Message) =>
        set(state => {
          const existing = state.chats[friendId] || [];
          const updated = [...existing, message].slice(-MAX_CACHED_MESSAGES);
          return {
            chats: {
              ...state.chats,
              [friendId]: updated,
            },
            lastMessages: {
              ...state.lastMessages,
              [friendId]: message.plaintext || message.message,
            },
          };
        }),
      clearMessages: () => set({chats: {}, lastMessages: {}}),

      prependMessages: (friendId: string, olderMessages: Message[]) =>
        set(state => {
          const existing = state.chats[friendId] || [];
          // Deduplicate by sent_at to avoid duplicates
          const existingTimes = new Set(existing.map(m => m.sent_at));
          const uniqueOlder = olderMessages.filter(
            m => !existingTimes.has(m.sent_at),
          );
          return {
            chats: {
              ...state.chats,
              [friendId]: [...uniqueOlder, ...existing],
            },
          };
        }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist data fields, not functions
      partialize: state => ({
        chats: state.chats,
        lastMessages: state.lastMessages,
      }),
    },
  ),
);

// Friends store with persistence
export type CachedFriend = {
  friendId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  lastMessage?: string;
  nonce?: string;
  lastMessageTime?: string;
};

type FriendsState = {
  friends: CachedFriend[];
  setFriends: (friends: CachedFriend[]) => void;
  clearFriends: () => void;
};

export const useFriendsStore = create<FriendsState>()(
  persist(
    set => ({
      friends: [],
      setFriends: (friends: CachedFriend[]) => set({friends}),
      clearFriends: () => set({friends: []}),
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        friends: state.friends,
      }),
    },
  ),
);
