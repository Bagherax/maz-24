import type { User } from './user';

export interface Attachment {
    fileName: string;
    fileType: string;
    fileSize: number;
    encryptedUrl: string; // A secure, encrypted link to the file in the sender's personal cloud
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
    attachment?: Attachment;
    signature?: string;
}

export interface Conversation {
    id: string; // Composite ID of participant user IDs, sorted alphabetically
    participantIds: string[];
    participantDetails: {
        // FIX: Storing the full User object to make all details available.
        [userId: string]: User
    };
    messages: ChatMessage[];
    lastMessage?: ChatMessage;
    relatedAdId?: string;
    relatedAdTitle?: string;
}
