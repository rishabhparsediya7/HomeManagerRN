import api from './api';

export interface Participant {
  userId: string;
  amountOwed: number;
  userName?: string;
  isPayer?: boolean;
  status?: string;
  amountPaid?: number;
}

export interface CreateSplitExpenseParams {
  description: string;
  totalAmount: number;
  category?: number;
  participants: Participant[];
  expenseDate?: string;
  paidBy: string;
}

export interface SplitExpense {
  id: string;
  createdBy: string;
  description: string;
  totalAmount: number;
  category: number | null;
  splitType: string;
  expenseDate: string;
  status: string;
  createdAt: string;
  participants: Participant[];
  creatorName?: string;
}

export interface Balance {
  friendId: string;
  friendName: string;
  friendPhoto?: string;
  balance: number;
}

export interface BalanceSummary {
  balances: Balance[];
  summary: {
    youOwe: number;
    youAreOwed: number;
    netBalance: number;
  };
}

export interface SettleUpParams {
  splitExpenseId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  note?: string;
}

export const splitExpenseApi = {
  /**
   * Create a new split expense
   */
  create: (data: CreateSplitExpenseParams) =>
    api.post<{success: boolean; data: SplitExpense}>('/api/split/create', data),

  /**
   * Get all split expenses for the current user
   */
  getList: () =>
    api.get<{success: boolean; data: SplitExpense[]}>('/api/split/list'),

  /**
   * Get details of a specific split expense
   */
  getDetails: (id: string) =>
    api.get<{success: boolean; data: SplitExpense}>(`/api/split/details/${id}`),

  /**
   * Delete a split expense
   */
  delete: (id: string) =>
    api.delete<{success: boolean; message: string}>(`/api/split/${id}`),

  /**
   * Get balances with all friends
   */
  getBalances: () =>
    api.get<{success: boolean; data: BalanceSummary}>('/api/split/balances'),

  /**
   * Get balance with a specific friend
   */
  getBalanceWithFriend: (friendId: string) =>
    api.get<{
      success: boolean;
      data: {
        balance: number;
        friendName: string;
        sharedExpenses: SplitExpense[];
      };
    }>(`/api/split/balance/${friendId}`),

  /**
   * Record a settlement (payment)
   */
  settleUp: (data: SettleUpParams) =>
    api.post<{success: boolean; message: string}>('/api/split/settle', data),

  /**
   * Get settlement history with a friend
   */
  getSettlementHistory: (friendId: string) =>
    api.get<{success: boolean; data: any[]}>(
      `/api/split/settlements/${friendId}`,
    ),
};

export default splitExpenseApi;
