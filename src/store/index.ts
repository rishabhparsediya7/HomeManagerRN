import { create } from 'zustand';
type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  nonce: string;
  sent_at: string;
  plaintext?: string;
};

type ChatState = {
  chats: Record<string, Message[]>;
  setMessagesOnStore: (friendId: string, messages: Message[]) => void;
  addMessageOnStore: (friendId: string, message: Message) => void;
  clearMessagesOnStore: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: {},

  setMessagesOnStore: (friendId, messages) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [friendId]: messages,
      },
    })),

  addMessageOnStore: (friendId, message) =>
    set((state) => {
      const prev = state.chats[friendId] || [];
      return {
        chats: {
          ...state.chats,
          [friendId]: [...prev, message],
        },
      };
    }),

  clearMessagesOnStore: () =>
    set(() => ({
      chats: {},
    })),
}));
