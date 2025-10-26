import type { User, Ad, AdminDashboardData, AdminLogEntry } from '../types';
import { MOCK_USERS, ADMIN_LOG_KEY, simulateDelay, getUserLocalAds, setUserLocalAds } from './mockData';
import { getCurrentUser } from './authService';
import { getAdSlotAnalytics } from './advertisingService';


/**
 * MAZDADY Admin & Compliance Service
 *
 * This service simulates the backend logic for administrative actions, governed by
 * a strict set of security and philosophical principles to protect user data sovereignty.
 *
 * ---
 *
 * ### Core Security & Philosophical Principles
 *
 * 1.  **No Direct Data Access:** Administrators do NOT have direct access to ad data.
 *     They can only view ad content through the same temporary, secure links as
 *     regular users. They cannot modify, download, or read data directly from a
 *     user's personal cloud.
 *
 * 2.  **Limited, Non-Destructive Actions:** An admin's power is strictly limited to:
 *     - Requesting the removal of an ad from the public discovery index.
 *     - Blocking access to the ad via the MAZ gateway.
 *     - Notifying the user of the violation.
 *     This ensures complete privacy and ethical decentralization.
 *
 * ---
 *
 * ### Admin Takedown Flow
 *
 * 1.  An admin identifies a suspicious listing in the dashboard (via user reports or AI analysis).
 * 2.  They initiate a "Takedown" action, citing a specific policy violation.
 * 3.  The system executes the following:
 *     a. Removes the ad's `public_id` from the Temporary Listing Index.
 *     b. Adds the ad's link to a blocklist at the API Gateway.
 *     c. Records the action in the immutable audit trail.
 * 4.  **Crucially, the ad's data file in the user's personal cloud is NEVER touched.**
 *     It remains the user's property but is no longer discoverable or accessible via MAZDADY.
 * 5.  To restore the ad, the user must modify it to comply with policy and republish it.
 *
 * ---
 *
 * ### Role-Based Access Control (RBAC)
 *
 * Access is governed by clearly defined roles (simulation):
 * - **Viewer:** View-only access to dashboards and reports.
 * - **Moderator:** Can execute takedowns and review reports.
 * - **Policy Admin:** Can manage the rules and policies of the platform.
 * - **Super Admin:** Full access, including managing other admin accounts.
 * - **UI Editor:** Can modify the application's visual theme.
 *
 * ---
 *
 * This service integrates with the existing Discovery Index and API Gateway to enforce
 * its decisions, fully respecting the "user-owned data" principle.
 */

const getAdminLog = (): AdminLogEntry[] => {
    const logJson = localStorage.getItem(ADMIN_LOG_KEY);
    return logJson ? JSON.parse(logJson) : [];
};

const setAdminLog = (log: AdminLogEntry[]) => {
    localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(log));
};

export const addAdminLogEntry = (adminUser: User, action: string, targetId: string, reason: string) => {
    const log = getAdminLog();
    const newEntry: AdminLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminId: adminUser.id,
        adminUsername: adminUser.username,
        action,
        targetId,
        reason,
    };
    log.unshift(newEntry); // Add to the top
    setAdminLog(log);
};


export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    await simulateDelay(1000);
    const currentUser = await getCurrentUser();
    if (currentUser?.tier !== 'MAZ') throw new Error("Unauthorized access.");

    let liveListings: Ad[] = [];
    let reportedListings: Ad[] = [];

    MOCK_USERS.forEach(user => {
        const userAds = getUserLocalAds(user.id);
        userAds.forEach(ad => {
            // Live listings are public or synced
            if (['public', 'synced'].includes(ad.syncStatus)) {
                liveListings.push(ad);
            }
            // Reported listings
            if (ad.isFlagged) {
                reportedListings.push(ad);
            }
        });
    });

    const advertisingAnalytics = await getAdSlotAnalytics();

    return {
        liveListings: liveListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        reportedListings: reportedListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        auditLog: getAdminLog(),
        advertisingAnalytics,
    };
};

export const takedownListing = async (adId: string, reason: string): Promise<void> => {
    await simulateDelay(500);
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser?.tier !== 'MAZ') throw new Error("Unauthorized access.");

    let adFound = false;
    for (const user of MOCK_USERS) {
        const userAds = getUserLocalAds(user.id);
        const adIndex = userAds.findIndex(ad => ad.id === adId || ad.publicId === adId);
        if (adIndex !== -1) {
            userAds[adIndex].syncStatus = 'takedown';
            userAds[adIndex].isFlagged = false; // Clear flag after action
            userAds[adIndex].takedownReason = reason;
            setUserLocalAds(user.id, userAds);
            addAdminLogEntry(adminUser, 'TAKEDOWN', userAds[adIndex].publicId || adId, reason);
            adFound = true;
            break;
        }
    }
    if (!adFound) throw new Error("Ad to takedown not found.");
};

export const dismissReport = async (adId: string): Promise<void> => {
    await simulateDelay(300);
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser?.tier !== 'MAZ') throw new Error("Unauthorized access.");

    let adFound = false;
    for (const user of MOCK_USERS) {
        const userAds = getUserLocalAds(user.id);
        const adIndex = userAds.findIndex(ad => ad.id === adId || ad.publicId === adId);
        if (adIndex !== -1) {
            userAds[adIndex].isFlagged = false;
            setUserLocalAds(user.id, userAds);
            addAdminLogEntry(adminUser, 'DISMISS_REPORT', userAds[adIndex].publicId || adId, 'Report deemed invalid.');
            adFound = true;
            break;
        }
    }
     if (!adFound) throw new Error("Ad to dismiss not found.");
};
