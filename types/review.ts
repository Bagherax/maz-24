import type { User } from './user';

export interface Review {
  id: string;
  adId: string;
  sellerId: string;
  reviewer: User;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
  signature?: string;
}
