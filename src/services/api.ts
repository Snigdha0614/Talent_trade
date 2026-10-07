import {
  User,
  Service,
  Project,
  Proposal,
  SkillExchangeRequest,
  Message,
  Notification,
  Review,
  Report,
  Payment,
  WishlistItem,
} from '../types';

const TOKEN_KEY = 'talenttrade_auth_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    demoLogin: (role: 'freelancer' | 'client' | 'admin') =>
      request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
    me: () => request<{ user: User }>('/auth/me'),
    forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  },

  // Users
  users: {
    getProfile: (id: string) => request<{ user: User; services: Service[]; reviews: Review[] }>(`/users/profile/${id}`),
    updateProfile: (data: Partial<User>) => request<{ user: User }>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    addSkill: (data: { name: string; category?: string; level: string }) =>
      request('/users/profile/skills', { method: 'POST', body: JSON.stringify(data) }),
    updateSkill: (skillId: string, data: any) =>
      request(`/users/profile/skills/${skillId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSkill: (skillId: string) => request(`/users/profile/skills/${skillId}`, { method: 'DELETE' }),
    addPortfolio: (data: any) => request('/users/profile/portfolio', { method: 'POST', body: JSON.stringify(data) }),
    deletePortfolio: (id: string) => request(`/users/profile/portfolio/${id}`, { method: 'DELETE' }),
    getFreelancers: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<{ freelancers: User[] }>(`/users/freelancers${q ? `?${q}` : ''}`);
    },
    getClients: () => request<{ clients: User[] }>('/users/clients'),
  },

  // Services
  services: {
    list: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<{ services: Service[] }>(`/services${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<{ service: Service; freelancer: Partial<User>; reviews: Review[] }>(`/services/${id}`),
    create: (data: any) => request<{ service: Service }>('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ service: Service }>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/services/${id}`, { method: 'DELETE' }),
  },

  // Projects
  projects: {
    list: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<{ projects: Project[] }>(`/projects${q ? `?${q}` : ''}`);
    },
    get: (id: string) =>
      request<{ project: Project; proposals: Proposal[]; client: Partial<User>; freelancer: Partial<User> }>(
        `/projects/${id}`
      ),
    create: (data: any) => request<{ project: Project }>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    addTask: (projectId: string, data: any) =>
      request(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
    updateTaskStatus: (projectId: string, taskId: string, status: string) =>
      request(`/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // Proposals
  proposals: {
    submit: (data: any) => request<{ proposal: Proposal }>('/proposals', { method: 'POST', body: JSON.stringify(data) }),
    getByProject: (projectId: string) => request<{ proposals: Proposal[] }>(`/proposals/project/${projectId}`),
    accept: (proposalId: string) => request(`/proposals/${proposalId}/accept`, { method: 'PATCH' }),
    reject: (proposalId: string) => request(`/proposals/${proposalId}/reject`, { method: 'PATCH' }),
  },

  // Skill Exchange
  exchange: {
    list: () => request<{ exchanges: SkillExchangeRequest[] }>('/exchange'),
    create: (data: any) => request<{ exchange: SkillExchangeRequest }>('/exchange', { method: 'POST', body: JSON.stringify(data) }),
    accept: (id: string) => request<{ exchange: SkillExchangeRequest; project: Project }>(`/exchange/${id}/accept`, { method: 'PATCH' }),
    reject: (id: string) => request(`/exchange/${id}/reject`, { method: 'PATCH' }),
  },

  // Workspace
  workspace: {
    getMessages: (projectId: string) => request<{ messages: Message[] }>(`/workspace/${projectId}/messages`),
    sendMessage: (projectId: string, data: { content?: string; attachment?: any }) =>
      request<{ message: Message }>(`/workspace/${projectId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
    submitWork: (projectId: string, data: { description: string; files: any[]; notes?: string }) =>
      request(`/workspace/${projectId}/submit-work`, { method: 'POST', body: JSON.stringify(data) }),
    reviewWork: (projectId: string, data: { action: 'ACCEPT' | 'REVISION'; revisionComments?: string }) =>
      request(`/workspace/${projectId}/review-work`, { method: 'POST', body: JSON.stringify(data) }),
    shareFile: (projectId: string, data: { name: string; url?: string; size?: string }) =>
      request(`/workspace/${projectId}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
    addToPortfolio: (projectId: string, data: any) =>
      request(`/workspace/${projectId}/add-to-portfolio`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Payments
  payments: {
    processDemoPayment: (data: { projectId: string; method: string }) =>
      request<{ payment: Payment; project: Project }>('/payments/demo', { method: 'POST', body: JSON.stringify(data) }),
    getReceipt: (projectId: string) => request<{ payment: Payment | null }>(`/payments/project/${projectId}`),
    getTransactions: () => request<{ transactions: Payment[] }>('/payments/transactions'),
  },

  // Reviews
  reviews: {
    submit: (data: { projectId: string; revieweeId: string; rating: number; comment: string }) =>
      request<{ review: Review; updatedRating: number }>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    getUserReviews: (userId: string) => request<{ reviews: Review[] }>(`/reviews/user/${userId}`),
  },

  // Notifications
  notifications: {
    list: () => request<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'POST' }),
  },

  // Wishlist
  wishlist: {
    get: () =>
      request<{ rawWishlist: WishlistItem[]; freelancers: User[]; services: Service[]; projects: Project[] }>(
        '/wishlist'
      ),
    toggle: (itemType: 'FREELANCER' | 'SERVICE' | 'PROJECT', itemId: string) =>
      request<{ saved: boolean; message: string }>('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ itemType, itemId }),
      }),
  },

  // Reports
  reports: {
    submit: (data: {
      type: string;
      description: string;
      evidence?: string;
      reportedUser?: string;
      serviceId?: string;
      projectId?: string;
    }) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<{ reports: Report[] }>('/reports'),
    update: (id: string, data: { status: string; adminResponse?: string }) =>
      request(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Admin
  admin: {
    getStats: () => request<{ stats: any }>('/admin/stats'),
    getUsers: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<{ users: User[] }>(`/admin/users${q ? `?${q}` : ''}`);
    },
    toggleUserStatus: (id: string) => request(`/admin/users/${id}/status`, { method: 'PATCH' }),
    deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    moderateService: (id: string, status: string) =>
      request(`/admin/services/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    resetDemoDb: () => request('/admin/reset-demo-db', { method: 'POST' }),
  },
};
