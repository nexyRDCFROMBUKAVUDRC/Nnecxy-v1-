/**
 * NNECXY - Central API Service
 * Connects frontend UI to real backend and Supabase
 * Enforces: No mock data, real error handling, strict source of truth
 */

import { UserProfile, VideoRecord, CommentRecord, ConversationRecord, MessageRecord, GroupRecord, NotificationRecord } from '../types';

const TOKEN_KEY = 'nnecxy_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      setStoredToken(null);
    }
    const message = data.error || data.message || `Erreur serveur (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  async signup(params: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    username: string;
    password: string;
    accept_terms: boolean;
  }): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ token: string; user: UserProfile }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(data.token);
    return data;
  },

  async login(identifier: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async deleteAccount(): Promise<void> {
    await request('/api/auth/delete-account', { method: 'DELETE' });
    setStoredToken(null);
  },

  // Videos
  async getFeed(): Promise<{ videos: VideoRecord[] }> {
    return request<{ videos: VideoRecord[] }>('/api/videos');
  },

  async getMyVideos(): Promise<{ videos: VideoRecord[] }> {
    return request<{ videos: VideoRecord[] }>('/api/videos/my');
  },

  async getUserVideos(userId: string): Promise<{ videos: VideoRecord[] }> {
    return request<{ videos: VideoRecord[] }>(`/api/videos/user/${userId}`);
  },

  async uploadVideo(formData: FormData): Promise<{ success: boolean; video: VideoRecord }> {
    return request<{ success: boolean; video: VideoRecord }>('/api/videos/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteVideo(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id: string): Promise<{ has_liked: boolean; likes_count: number }> {
    return request<{ has_liked: boolean; likes_count: number }>(`/api/videos/${id}/like`, {
      method: 'POST',
    });
  },

  async getComments(videoId: string): Promise<{ comments: CommentRecord[] }> {
    return request<{ comments: CommentRecord[] }>(`/api/videos/${videoId}/comments`);
  },

  async postComment(videoId: string, content: string): Promise<{ comment: CommentRecord }> {
    return request<{ comment: CommentRecord }>(`/api/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(videoId: string, commentId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/videos/${videoId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // Signalements (Section 27)
  async reportVideo(params: {
    video_id: string;
    reason: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; auto_moderated?: string }> {
    return request<{ success: boolean; message: string; auto_moderated?: string }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Users & Profiles
  async getUserProfile(id: string): Promise<{ profile: UserProfile & { videos: VideoRecord[]; is_following: boolean } }> {
    return request<{ profile: UserProfile & { videos: VideoRecord[]; is_following: boolean } }>(`/api/users/${id}`);
  },

  async updateProfile(params: { first_name?: string; last_name?: string; bio?: string; avatar_url?: string }): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  async toggleFollow(targetId: string): Promise<{ is_following: boolean; followers_count: number }> {
    return request<{ is_following: boolean; followers_count: number }>(`/api/users/${targetId}/follow`, {
      method: 'POST',
    });
  },

  // Search
  async search(query: string): Promise<{ users: UserProfile[]; videos: VideoRecord[] }> {
    return request<{ users: UserProfile[]; videos: VideoRecord[] }>(`/api/search?q=${encodeURIComponent(query)}`);
  },

  // Conversations & Messages
  async getConversations(): Promise<{ conversations: ConversationRecord[] }> {
    return request<{ conversations: ConversationRecord[] }>('/api/conversations');
  },

  async createConversation(targetUserId: string): Promise<{ conversation: ConversationRecord }> {
    return request<{ conversation: ConversationRecord }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
  },

  async getMessages(conversationId: string): Promise<{ messages: MessageRecord[] }> {
    return request<{ messages: MessageRecord[] }>(`/api/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId: string, content: string): Promise<{ message: MessageRecord }> {
    return request<{ message: MessageRecord }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Groups
  async getGroups(): Promise<{ groups: GroupRecord[] }> {
    return request<{ groups: GroupRecord[] }>('/api/groups');
  },

  async createGroup(name: string, description?: string): Promise<{ group: GroupRecord }> {
    return request<{ group: GroupRecord }>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationRecord[] }> {
    return request<{ notifications: NotificationRecord[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  // Events
  async logEvent(videoId: string, eventType: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await request('/api/events', {
        method: 'POST',
        body: JSON.stringify({ video_id: videoId, event_type: eventType, metadata }),
      });
    } catch {
      // Background telemetry
    }
  },

  // Health & Backend diagnostic
  async checkHealth(): Promise<{
    status: string;
    app: string;
    version: string;
    backend?: {
      connected: boolean;
      storage: string;
      database: string;
      counts?: { profiles: number; videos: number; reports: number };
      supabase?: { configured: boolean; project_url?: string | null };
    };
  }> {
    return request('/api/health');
  },
};
