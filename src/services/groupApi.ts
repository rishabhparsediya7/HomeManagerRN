import api from './api';

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: string;
  type: string;
  createdByUser: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  balanceSummary?: {
    youAreOwed: number;
    youOwe: number;
    net: number;
  };
}

export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  recentExpenses: GroupExpense[];
}

export interface GroupExpense {
  id: string;
  description: string;
  totalAmount: string;
  splitType: string;
  expenseDate: string;
  createdBy: string;
  creatorName?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  message: string;
  messageType: string;
  metadata: any;
  sentAt: string;
  senderName: string;
  senderProfilePicture?: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  targetUserId?: string;
  groupId?: string;
  splitExpenseId?: string;
  action: string;
  description: string;
  metadata?: string;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
}

export interface CreateGroupParams {
  name: string;
  members: string[];
  description?: string;
  image?: string;
  type?: string;
}

const groupApi = {
  // Group CRUD
  getGroupList: () => api.get('/api/group/list'),

  getGroupDetails: (groupId: string) =>
    api.get(`/api/group/details/${groupId}`),

  createGroup: (params: CreateGroupParams) =>
    api.post('/api/group/create', params),

  updateGroup: (params: {
    groupId: string;
    name?: string;
    description?: string;
    image?: string;
    type?: string;
  }) => api.post('/api/group/update', params),

  deleteGroup: (groupId: string) =>
    api.post('/api/group/deleteGroup', {groupId}),

  // Members
  getGroupMembers: (groupId: string) =>
    api.get(`/api/group/${groupId}/members`),

  addMembers: (groupId: string, members: string[]) =>
    api.post('/api/group/addMembers', {groupId, members}),

  removeMembers: (groupId: string, members: string[]) =>
    api.post('/api/group/removeMembers', {groupId, members}),

  // Group activity
  getGroupActivity: (groupId: string, page: number = 1) =>
    api.get(`/api/group/${groupId}/activity`, {params: {page}}),

  // Group chat
  getGroupMessages: (groupId: string, page: number = 1) =>
    api.get(`/api/group/${groupId}/messages`, {params: {page}}),

  sendGroupMessage: (groupId: string, message: string) =>
    api.post(`/api/group/${groupId}/messages`, {message}),

  // Group expenses
  getGroupExpenses: (groupId: string) =>
    api.get(`/api/split/group/${groupId}/expenses`),

  // User activity feed
  getUserActivityFeed: (page: number = 1) =>
    api.get('/api/group/activity/feed', {params: {page}}),

  getUnreadActivityCount: () => api.get('/api/group/activity/unread'),

  markActivityAsRead: (activityId: string) =>
    api.post('/api/group/activity/read', {activityId}),
};

export default groupApi;
