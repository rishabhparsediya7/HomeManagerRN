import { create } from 'zustand';

export type Message = {
  id: number;
  sender_id: string | null;
  receiver_id: string;
  message: string;
  nonce: string;
  sent_at: string;
  plaintext?: string;
};

type ChatState = {
  chats: Record<string, Message[]>;
  lastMessages: Record<string, string>;
  setMessages: (friendId: string, messages: Message[]) => void;
  addMessage: (friendId: string, message: Message) => void;
  lastMessage: (friendId: string, message: string) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: {},
  lastMessages: {},
  setMessages: (friendId: string, messages: Message[]) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [friendId]: messages,
      },
    })),

  addMessage: (friendId: string, message: Message) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [friendId]: [...(state.chats[friendId] || []), message],
      },
    })),
  lastMessage: (friendId: string, message: string) =>
    set((state) => ({
      ...state,
      lastMessages: {
        ...state.lastMessages,
        [friendId]: message,
      },
    })),

  clearMessages: () => set({ chats: {}, lastMessages: {} }),
}));
