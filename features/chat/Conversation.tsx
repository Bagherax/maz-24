import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, User, Attachment, Conversation as ConversationType } from '../../types';
import * as api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { LockIcon } from '../../components/icons/LockIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { SendIcon } from '../../components/icons/SendIcon';
import { useNotification } from '../../hooks/useNotification';
import { StarIcon } from '../../components/icons/StarIcon';
import LeaveReviewModal from './LeaveReviewModal';

interface ConversationProps {
    conversationId?: string; // Optional for new conversations
    recipient: User;
    onBack: () => void;
}

const Conversation: React.FC<ConversationProps> = ({ conversationId, recipient, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversation, setConversation] = useState<ConversationType | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const { identity: currentUser } = useAuth();
    const { addNotification } = useNotification();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        if (!conversationId) {
             setMessages([{
                id: 'system-1',
                conversationId: 'system',
                senderId: 'system',
                receiverId: 'system',
                text: "Your conversation is secured with E2E encryption. No one outside of this chat, not even the platform operators, can read your messages.",
                timestamp: new Date().toISOString(),
                isRead: true,
            }]);
            setLoading(false);
            return;
        };
        try {
            const [fetchedMessages, convos] = await Promise.all([
                api.getMessages(conversationId),
                api.getConversations() // Also fetch conversation details for the ad link
            ]);
            const currentConvo = convos.find(c => c.id === conversationId);
            setConversation(currentConvo || null);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);
    
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            conversationId: conversationId || 'new',
            senderId: currentUser.id,
            receiverId: recipient.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        try {
            await api.sendMessage(recipient.id, optimisticMessage.text);
            // In a real app, a websocket would confirm this. Here, we just refresh.
            fetchMessages();
        } catch (error) {
            addNotification('Failed to send message.', 'error');
            // Revert optimistic update on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };
    
    const handleAttachFile = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;
        
        const attachment: Omit<Attachment, 'encryptedUrl'> = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
        };
        
        addNotification('File encrypted and stored in your personal cloud.', 'info');

        try {
            await api.sendMessage(recipient.id, `Sent an attachment: ${file.name}`, attachment);
            fetchMessages();
        } catch (error) {
             addNotification('Failed to send attachment.', 'error');
        }
    };
    
    const handleDownloadAttachment = (attachment: Attachment) => {
        addNotification(`Downloading and decrypting ${attachment.fileName}...`, 'info');
        // Simulate download
        setTimeout(() => {
            addNotification('File downloaded successfully!', 'success');
        }, 1500);
    };

    return (
        <>
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 bg-secondary h-16 flex items-center justify-between px-2 border-b border-border-color">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5"><ChevronLeftIcon /></button>
                <div className="flex flex-col items-center text-center">
                    <h3 className="font-bold text-text-primary">{recipient.username}</h3>
                    {conversation?.relatedAdTitle && <p className="text-xs text-text-secondary truncate max-w-[150px]">re: {conversation.relatedAdTitle}</p>}
                </div>
                {conversation?.relatedAdId ? (
                    <button onClick={() => setIsReviewModalOpen(true)} className="p-2 text-text-secondary hover:text-yellow-400 rounded-full" title="Leave a review for this transaction">
                        <StarIcon className="h-6 w-6" />
                    </button>
                ) : (
                    <img src={recipient.avatarUrl} alt={recipient.username} className="w-10 h-10 rounded-full" />
                )}
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                    const isCurrentUser = msg.senderId === currentUser?.id;
                    const isSystem = msg.senderId === 'system';
                    
                    if (isSystem) {
                        return (
                             <div key={msg.id} className="text-center text-xs text-text-secondary my-4">
                                <p className="inline-block bg-primary px-2 py-1 rounded-full">{msg.text}</p>
                            </div>
                        )
                    }

                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                            <div className={`w-3/4 flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-accent text-white rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                                    <p>{msg.text}</p>
                                    {msg.attachment && (
                                        <button onClick={() => handleDownloadAttachment(msg.attachment!)} className="mt-2 text-sm underline flex items-center">
                                            <PaperclipIcon />
                                            <span className="ml-2">{msg.attachment.fileName}</span>
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-text-secondary mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 bg-secondary border-t border-border-color">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
                    <button type="button" onClick={handleAttachFile} className="p-2 text-text-secondary hover:text-accent rounded-full"><PaperclipIcon /></button>
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-primary border border-border-color rounded-full py-2 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button type="submit" className="p-2 bg-accent text-white rounded-full hover:bg-accent-hover"><SendIcon /></button>
                </form>
            </footer>
        </div>
        {isReviewModalOpen && conversation?.relatedAdId && (
            <LeaveReviewModal
                adId={conversation.relatedAdId}
                seller={recipient}
                onClose={() => setIsReviewModalOpen(false)}
            />
        )}
        </>
    );
};

export default Conversation;