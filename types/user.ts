import type { AdCollection } from './collection';

export type AdminRole = 'viewer' | 'moderator' | 'policy_admin' | 'super_admin' | 'ui_editor';

export interface QAPair {
  question: string;
  answer: string;
  adId: string; // Context for which ad this Q&A is related to
}

export interface ChatSettings {
  welcomeMessage?: string;
  quickReplies?: string[];
}


export interface User {
  id: string;
  username: string;
  email: string;
  tier: 'normal' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'su_diamond' | 'MAZ';
  isVerified: boolean;
  avatarUrl: string;
  profileBannerUrl?: string;
  profileBackgroundUrl?: string;
  role?: AdminRole;
  averageRating?: number;
  totalReviews?: number;
  followingIds?: string[];
  followersCount?: number;
  collections?: AdCollection[];
  chatSettings?: ChatSettings;
  learnedQA?: QAPair[];
}

// Represents a user with a temporary, local-only session.
export interface TempUser {
  type: 'TEMP_USER';
  id: string;
  username: string;
}

// Represents a fully authenticated user.
export interface FullUser extends User {
  type: 'FULL_USER';
}

// Represents the user's current identity state in the app.
// It can be a full user, a temporary user, or null (guest).
export type Identity = FullUser | TempUser;
