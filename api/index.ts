/**
 * MAZDADY Smart Infrastructure - API Gateway
 * 
 * This is the central entry point for the frontend to interact with the simulated backend.
 * It documents and implements the core architectural principles of the MAZDADY platform.
 * 
 * ---
 * 
 * ### 1. Hybrid Architecture (On-Device + Private Cloud)
 * MAZDADY operates on a user-centric hybrid model that maximizes privacy and data ownership.
 * 
 * - **On-Device Storage (Primary):** All user-generated data (ads, chats) is first created
 *   and stored locally in the browser's localStorage. This ensures offline functionality
 *   and makes the user's device the primary source of truth.
 * - **Private Cloud (Persistence & Availability):** Users can connect their own Nextcloud or
 *   MinIO instances. "Syncing" an ad transfers it to their cloud, making it persistently
 *   available to the network even when the user is offline.
 * - **Lightweight Central Server (Discovery & Relay):** The central server is stateless.
 *   It does not store user data. Its only roles are to temporarily index "public" ads from
 *   online users (Discovery) and relay E2E encrypted messages (Relay).
 * 
 * ---
 * 
 * ### 2. Microservice Architecture
 * The backend is designed as a collection of independent, specialized microservices. This allows
 * for modular development, independent scaling, and resilience.
 * 
 * - **Auth Service:** Manages user identity, registration, and authentication (simulated OAuth2).
 * - **Listing Service:** Handles the creation, updating, and status management of ads and auctions.
 * - **Chat Service:** Relays E2E encrypted messages between peers without storing them.
 * - **AI Gateway:** A dedicated service (simulated via `aiService`) that manages requests
 *   to large language models for features like ad generation and smart suggestions.
 * - **Discovery Service:** Maintains a temporary index of active/public ads for discoverability.
 * - **Notification Service:** Manages real-time alerts for bids, messages, etc.
 * 
 * This frontend mock API is structured to mirror this design, with separate files for each service.
 * 
 * ---
 * 
 * ### 3. Horizontal Scalability (Kubernetes-Ready)
 * The entire stateless microservice architecture is designed for horizontal scalability. In a
 * production environment, these services would be containerized and managed by an orchestrator
 * like Kubernetes.
 * 
 * This allows the platform to automatically scale individual components (like the AI Gateway or
 * Discovery Service) based on demand, ensuring consistent performance for millions of users
 * without a single point of failure.
 * 
 * ---
 * 
 * ### Ad Publishing & Discovery Flow (User-Owned Data)
 * This flow ensures that the user always retains control over their ad data.
 * 
 * 1.  **Local-First Creation:** A user creates an ad, which is saved as a draft on their
 *     device (`LocalListingStore`). The ad's status is `local`.
 * 2.  **User Opt-in for Cloud Sync:** The user chooses to "Sync to Cloud".
 * 3.  **Manifest Generation:** The app generates a `manifest.json` file containing all
 *     ad details (title, description, image URLs, price, etc.).
 * 4.  **Cloud Upload:** The `manifest.json` is uploaded to the user's connected personal
 *     cloud (Nextcloud/MinIO).
 * 5.  **Secure URL & Signature:** The app generates a secure, tokenized URL for the uploaded
 *     manifest and signs it with the user's private key (simulated as a JWT).
 * 6.  **Registration:** The app sends only the public ID, the secure URL, the signature,
 *     and a TTL to the MAZDADY Discovery Service.
 *     ```json
 *     {
 *       "public_id": "uuid-123",
 *       "listing_url": "https://user-cloud.com/ads/123.json?token=xyz",
 *       "signature": "JWT-signed-by-user-key",
 *       "ttl_hours": 24
 *     }
 *     ```
 * 7.  **Peer Discovery:** When another user searches, the Discovery Service returns the
 *     `listing_url`. Their app then downloads the ad data *directly* from the seller's
 *     cloud, verifying the signature to ensure data integrity.
 * 
 * This architecture fulfills the vision: "The ad goes out with the user, unless they decide
 * to leave a smart copy that works on their behalf."
 * 
 * ---
 * 
 * **NOTE:** This is a MOCK service simulating the described architecture using browser localStorage.
 */

export * from './authService';
export * from './listingService';
export * from './chatService';
export * from './reviewService';
export * from './configService';
export * from './adminService';
export * from './themeService';
export * from './aiService';
export * from './masaService';
export * from './categoryService';
export * from './userService';
export * from './collectionService';
export * from './advertisingService';
