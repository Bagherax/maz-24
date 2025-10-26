import type { Theme, User } from '../types';
import { simulateDelay } from './mockData';
import { getCurrentUser } from './authService';
import { addAdminLogEntry } from './adminService';

/**
 * MAZDADY P2P Theme Service
 *
 * This service simulates the decentralized distribution of UI themes, removing any
 * reliance on external, centralized services like CDNs or GitHub.
 *
 * ---
 *
 * ### P2P Theme Distribution Flow (Simulation)
 *
 * 1.  **Asset Storage (Admin's Private Cloud):** All theme resources, including
 *     the `theme.json` manifest and image assets (logos, backgrounds), are stored
 *     in the administrator's own private, self-hosted cloud (e.g., MinIO, Nextcloud).
 *     No assets are hosted on external platforms.
 *
 * 2.  **Theme Generation & Signing:** When an authorized admin modifies the theme:
 *     a. The app generates a theme package (`theme.json` + asset references).
 *     b. This package is **digitally signed** with the admin's private key to ensure
 *        authenticity and prevent tampering.
 *
 * 3.  **P2P Publishing (`publishTheme`):** When the admin clicks "Publish," the
 *     signed and encrypted package is broadcast across the network:
 *     a. **Encryption & Chunking:** The package is encrypted and, if large, broken
 *        into smaller chunks for efficient transfer.
 *     b. **P2P Broadcast to Trusted Nodes:** The chunks are sent via a custom P2P
 *        protocol to a set of "Trusted Nodes"—a selection of reliable peers
 *        (like other admins or internal servers) that act as relays for the update.
 *
 *     **Simulation:** For this app, the "broadcast" is simulated by writing the new
 *     theme to a single, globally-accessible key in `localStorage`.
 *
 * 4.  **Client-Side Sync (`getTheme`):**
 *     a. **P2P Listening:** On startup, each client app listens for theme updates from
 *        the P2P network.
 *     b. **Download & Verification:** When an update is found, the client downloads it
 *        from the nearest Trusted Node and **critically verifies the admin's digital
 *        signature.** An update with an invalid signature is rejected.
 *     c. **Application:** If verified, the theme is reassembled and applied dynamically
 *        without requiring an app restart.
 *
 *     **Simulation:** The client simply reads the theme object from the global
 *     `localStorage` key.
 */

const THEME_KEY = 'mazdady_global_theme';

const DEFAULT_THEME: Theme = {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    accent: '#4F46E5',
    'accent-hover': '#4338CA',
    'text-primary': '#111827',
    'text-secondary': '#6B7280',
    'border-color': '#E5E7EB',
};

export const getTheme = async (): Promise<Theme> => {
    await simulateDelay(50);
    const themeJson = localStorage.getItem(THEME_KEY);
    return themeJson ? JSON.parse(themeJson) : DEFAULT_THEME;
};

export const publishTheme = async (theme: Theme): Promise<void> => {
    await simulateDelay(500);
    const adminUser = await getCurrentUser();
    const canEditTheme = adminUser?.role === 'super_admin' || adminUser?.role === 'ui_editor';

    if (!adminUser || !canEditTheme) {
        throw new Error("Unauthorized: You do not have permission to edit the theme.");
    }
    
    // Simulate P2P broadcast by saving to a global key
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));

    // Log this administrative action to the audit trail
    addAdminLogEntry(adminUser, 'PUBLISH_THEME', 'global_theme', 'UI theme updated via P2P distribution system.');
};