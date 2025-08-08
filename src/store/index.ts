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
      lastMessages: {
        ...state.lastMessages,
        [friendId]: message.plaintext || message.message, // fallback to encrypted if plaintext not yet available
      },
    })),
  clearMessages: () => set({ chats: {}, lastMessages: {} }),
}));
