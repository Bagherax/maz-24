import type { User, Conversation, ChatMessage, Attachment } from '../types';
import { MOCK_USERS, simulateDelay, getUserLocalConvos, setUserLocalConvos } from './mockData';
import { getCurrentUser } from './authService';

export const getConversations = async (): Promise<Conversation[]> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];
    const convos = getUserLocalConvos(currentUser.id);
    // Sort by last message timestamp
    convos.sort((a, b) => 
        new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
    );
    return convos;
};

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    await simulateDelay(100);
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];
    
    const convos = getUserLocalConvos(currentUser.id);
    const convo = convos.find(c => c.id === conversationId);
    return convo?.messages || [];
};

const findOrCreateConversation = (
    currentUser: User,
    receiver: User,
    adId?: string,
    adTitle?: string
): { senderConvo: Conversation, receiverConvo: Conversation, convoId: string } => {
    const convoId = [currentUser.id, receiver.id].sort().join('-');
    
    let senderConvos = getUserLocalConvos(currentUser.id);
    let receiverConvos = getUserLocalConvos(receiver.id);

    let senderConvo = senderConvos.find(c => c.id === convoId);
    let receiverConvo = receiverConvos.find(c => c.id === convoId);

    const participantDetails = {
        [currentUser.id]: currentUser,
        [receiver.id]: receiver
    };

    if (!senderConvo) {
        senderConvo = { id: convoId, participantIds: [currentUser.id, receiver.id], participantDetails, messages: [], relatedAdId: adId, relatedAdTitle: adTitle };
        senderConvos.push(senderConvo);
    }
    if (!receiverConvo) {
        receiverConvo = { id: convoId, participantIds: [currentUser.id, receiver.id], participantDetails, messages: [], relatedAdId: adId, relatedAdTitle: adTitle };
        receiverConvos.push(receiverConvo);
    }
    
    // If starting a chat from an ad, ensure the ad details are set on existing convos too
    if (adId && !senderConvo.relatedAdId) {
        senderConvo.relatedAdId = adId;
        senderConvo.relatedAdTitle = adTitle;
    }
    if (adId && !receiverConvo.relatedAdId) {
        receiverConvo.relatedAdId = adId;
        receiverConvo.relatedAdTitle = adTitle;
    }


    setUserLocalConvos(currentUser.id, senderConvos);
    setUserLocalConvos(receiver.id, receiverConvos);

    return { senderConvo, receiverConvo, convoId };
};

export const startConversationWithSeller = async (seller: User, adId: string, adTitle: string): Promise<string> => {
    await simulateDelay(200);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");
    if (currentUser.id === seller.id) throw new Error("Cannot start a conversation with yourself.");

    const { convoId } = findOrCreateConversation(currentUser, seller, adId, adTitle);
    return convoId;
};

export const sendMessage = async (
    receiverId: string,
    text: string,
    attachment?: Omit<Attachment, 'encryptedUrl'>,
    adId?: string,
    adTitle?: string
): Promise<ChatMessage> => {
    await simulateDelay(400);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const receiver = MOCK_USERS.find(u => u.id === receiverId);
    if (!receiver) throw new Error("Recipient not found.");

    const { convoId: finalConvoId } = findOrCreateConversation(currentUser, receiver, adId, adTitle);

    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: finalConvoId,
        senderId: currentUser.id,
        receiverId: receiver.id,
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
        signature: `signed_by_${currentUser.id}_at_${Date.now()}` // Mock signature
    };

    if (attachment) {
        newMessage.attachment = {
            ...attachment,
            // Simulate encryption and storage in sender's personal cloud
            encryptedUrl: `mazdady-cloud://${currentUser.id}/attachments/${attachment.fileName}?sig=...`
        };
    }

    // --- P2P Simulation: Save message to BOTH users' local storage ---
    // Refetch sender convos in case a new one was just created by findOrCreateConversation
    const allSenderConvos = getUserLocalConvos(currentUser.id);
    const receiverConvos = getUserLocalConvos(receiver.id);

    const senderConvo = allSenderConvos.find(c => c.id === finalConvoId)!;
    const receiverConvo = receiverConvos.find(c => c.id === finalConvoId)!;

    senderConvo.messages.push(newMessage);
    senderConvo.lastMessage = newMessage;

    receiverConvo.messages.push(newMessage);
    receiverConvo.lastMessage = newMessage;

    setUserLocalConvos(currentUser.id, allSenderConvos);
    setUserLocalConvos(receiver.id, receiverConvos);

    return newMessage;
};