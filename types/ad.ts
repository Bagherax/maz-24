import type { User } from './user';

export type AdSyncStatus = 'local' | 'public' | 'synced' | 'takedown';
export type ListingType = 'buy-now' | 'auction';
export type AuctionType = 'english' | 'dutch' | 'sealed';
export type AdCondition = 'new' | 'used' | 'refurbished';

export type MediaType = 'image' | 'video' | 'pdf' | 'youtube';

export interface Media {
  type: MediaType;
  url: string; // For uploaded files, blob URL. For YouTube, embed URL.
  thumbnailUrl?: string; // Optional: for videos or YouTube links.
  fileName?: string; // Optional: for files like PDFs.
  file?: File; // Store the original file object for upload
}

export interface Bid {
  userId: string;
  username: string;
  amount: number;
  timestamp: string;
  signature: string; // Mocked digital signature
}

export interface AuctionDetails {
  startTime: string;
  endTime: string;
  startPrice: number;
  currentPrice?: number; // For Dutch auctions
  bids: Bid[];
}

export interface Ad {
  id: string; // This will be the local/device ID
  publicId?: string; // A UUID generated for network sharing
  title: string;
  description:string;
  price: number;
  seller: User;
  media: Media[];
  location: string; 
  rating: number; 
  reviews: number; 
  condition: AdCondition; 
  viewCount?: number; 
  specs?: { [key: string]: string };
  createdAt: string;
  listingType: ListingType;
  syncStatus: AdSyncStatus;
  auctionType?: AuctionType;
  auctionDetails?: AuctionDetails;
  version?: number; 
  boostScore?: number;
  cloudUrl?: string;
  signature?: string;
  isFlagged?: boolean;
  reportReason?: string;
  takedownReason?: string;
  categoryPath?: string[];
}