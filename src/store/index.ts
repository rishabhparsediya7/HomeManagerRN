import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

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
// Home store with persistence
export type FinanceSummary = {
  totalExpenses: number;
  totalIncome: number;
  totalBudget: number;
};

export type HomeState = {
  recentExpenses: any[]; // Using any[] temporarily to avoid circular deps with Home.tsx types
  financeSummary: FinanceSummary;
  unreadNotifications: number;
  categoryChartData: any[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setRecentExpenses: (expenses: any[]) => void;
  addExpenseToRecent: (expense: any) => void;
  setFinanceSummary: (summary: FinanceSummary) => void;
  setUnreadNotifications: (count: number) => void;
  decrementUnreadNotifications: () => void;
  clearUnreadNotifications: () => void;
  setCategoryChartData: (data: any[]) => void;
  setHomeData: (data: {
    recentExpenses: any[];
    financeSummary: FinanceSummary;
    categoryChartData: any[];
    unreadNotifications: number;
  }) => void;
  fetchHomeData: (force?: boolean) => Promise<void>;
};

// Helper for deep comparison (simple version for this use case)
const isDataChanged = (oldData: any, newData: any) => {
  return JSON.stringify(oldData) !== JSON.stringify(newData);
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      recentExpenses: [],
      financeSummary: {
        totalExpenses: 0,
        totalIncome: 0,
        totalBudget: 0,
      },
      unreadNotifications: 0,
      categoryChartData: [],

      setRecentExpenses: expenses => set({recentExpenses: expenses}),

      addExpenseToRecent: expense =>
        set(state => ({
          recentExpenses: [expense, ...state.recentExpenses].slice(0, 5),
        })),

      setFinanceSummary: summary => set({financeSummary: summary}),

      setUnreadNotifications: count => set({unreadNotifications: count}),

      decrementUnreadNotifications: () =>
        set(state => ({
          unreadNotifications: Math.max(0, state.unreadNotifications - 1),
        })),

      clearUnreadNotifications: () => set({unreadNotifications: 0}),

      setCategoryChartData: data => set({categoryChartData: data}),

      setHomeData: data =>
        set({
          recentExpenses: data.recentExpenses,
          financeSummary: data.financeSummary,
          categoryChartData: data.categoryChartData,
          unreadNotifications: data.unreadNotifications,
        }),

      isLoading: false,
      error: null,
      _hasHydrated: false,
      setHasHydrated: state => set({_hasHydrated: state}),

      fetchHomeData: async (force = false) => {
        const state = get();

        // If we haven't hydrated yet, we can't accurately know if it's the first load.
        // We should skip the loading indicator in this case to avoid flashing.
        const isFirstLoad =
          state._hasHydrated &&
          state.recentExpenses.length === 0 &&
          state.financeSummary.totalExpenses === 0;

        if (isFirstLoad || force) {
          set({isLoading: true, error: null});
        }

        try {
          const [expenseRes, categoryRes, notificationRes] = await Promise.all([
            api.get(`/api/expense/get-home-summary`),
            api.get(`/api/expense/getExpenseByCategory`),
            api.get('/api/notifications/me'),
          ]);

          const newRecentExpenses =
            expenseRes.data?.data?.last5Transactions || [];
          const newCategoryDataRaw = categoryRes.data?.data || [];
          const newFinanceSummary: FinanceSummary = {
            totalExpenses: Number(
              expenseRes.data?.data?.financeSummary?.amountSpent || 0,
            ),
            totalIncome: Number(
              expenseRes.data?.data?.financeSummary?.totalIncome || 0,
            ),
            totalBudget: Number(
              expenseRes.data?.data?.financeSummary?.budget || 0,
            ),
          };

          // Map category data (we'll need the mapper here or imported)
          // For now, assume the caller or a helper handles mapping if needed,
          // but to keep it clean, we'll store raw or mapped based on app needs.
          // Since the component needs mapped data, let's keep the setter flexible.

          const newState: Partial<HomeState> = {};

          if (isDataChanged(state.recentExpenses, newRecentExpenses)) {
            newState.recentExpenses = newRecentExpenses;
          }

          if (isDataChanged(state.financeSummary, newFinanceSummary)) {
            newState.financeSummary = newFinanceSummary;
          }

          const newUnreadCount = notificationRes.data.unreadCount || 0;
          if (newUnreadCount !== state.unreadNotifications) {
            newState.unreadNotifications = newUnreadCount;
          }

          // We'll let the component pass the mapped chart data for now to avoid duplicative logic
          // but at least we've centralized the core sync.

          if (Object.keys(newState).length > 0) {
            set(newState);
          }
        } catch (err: any) {
          console.error('Error fetching home data:', err);
          set({error: err.message || 'Failed to fetch data'});
        } finally {
          set({isLoading: false});
        }
      },
    }),
    {
      name: 'home-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        recentExpenses: state.recentExpenses,
        financeSummary: state.financeSummary,
        unreadNotifications: state.unreadNotifications,
        categoryChartData: state.categoryChartData,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
