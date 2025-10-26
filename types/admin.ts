import type { Ad } from './ad';
import type { AdSlotAnalytics } from './advertising';

export interface AdminLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminUsername: string;
  action: string; // e.g., 'TAKEDOWN', 'DISMISS_REPORT'
  targetId: string; // e.g., adId or userId
  reason: string;
}

export interface AdminDashboardData {
    liveListings: Ad[];
    reportedListings: Ad[];
    auditLog: AdminLogEntry[];
    advertisingAnalytics: AdSlotAnalytics[];
}
