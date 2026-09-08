/**
 * NNECXY - Global TypeScript Definitions
 * Strictly adhering to PROMPT MAÎTRE FINAL NNECXY
 */

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export interface VideoRecord {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  downloads_count: number;
  is_download_allowed: boolean;
  is_shadow_banned: boolean;
  boost_score: number;
  visibility: 'public' | 'private' | 'demoted';
  created_at: string;
  creator?: UserProfile;
  has_liked?: boolean;
  is_following_creator?: boolean;
}

export interface CommentRecord {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: UserProfile;
}

export interface ReportRecord {
  id: string;
  video_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  created_at: string;
}

export interface ConversationRecord {
  id: string;
  is_group: boolean;
  title?: string;
  created_at: string;
  updated_at: string;
  members: UserProfile[];
  last_message?: MessageRecord;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

export interface GroupRecord {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  owner_id: string;
  created_at: string;
  members_count: number;
  members?: {
    user: UserProfile;
    role: 'owner' | 'admin' | 'member';
  }[];
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'group_invite';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  actor?: UserProfile;
}

// 13 Official Moderation Reasons (Exact string matching Section 27)
export const REPORT_REASONS_EXACT = [
  "Harcèlement et intimidation",
  "Spam et contenu indésirable",
  "Contenu sexuel / Nudité / Pornographie",
  "Abus sexuel / Exploitation sexuelle",
  "Mise en danger ou exploitation de mineur",
  "Contenu violent, sanglant ou choquant",
  "Discours haineux ou discriminatoire",
  "Informations fausses ou trompeuses",
  "Arnaque, escroquerie ou faux compte",
  "Atteinte à la propriété intellectuelle (vol de vidéo)",
  "Drogue, médicaments ou substances illicites",
  "Suicide, automutilation ou troubles alimentaires",
  "Autre raison",
] as const;

export type ReportReason = typeof REPORT_REASONS_EXACT[number];

export type SupportedLanguage =
  | 'fr'
  | 'en'
  | 'sw'
  | 'ln'
  | 'ha'
  | 'pt'
  | 'ar'
  | 'es'
  | 'zh'
  | 'hi';

export type AppTheme = 'light' | 'dark';

export type AppTab = 'feed' | 'create' | 'profile';

export type AppRoute =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'main' // contains tabs: feed, create, profile
  | 'creator_profile'
  | 'search'
  | 'messages'
  | 'conversation'
  | 'groups'
  | 'group_detail'
  | 'group_create'
  | 'notifications'
  | 'my_videos'
  | 'settings'
  | 'booster_info'
  | 'monetization_info';
