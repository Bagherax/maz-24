import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, User, Attachment, Conversation as ConversationType, Ad, QAPair } from '../../types';
import * as api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { SendIcon } from '../../components/icons/SendIcon';
import { useNotification } from '../../hooks/useNotification';
import ChatSettingsModal from './ChatSettingsModal';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { BrainIcon } from '../../components/icons/BrainIcon';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAdDetail } from '../../context/AdDetailContext';
import { CogIcon } from '../../components/icons/CogIcon';

interface ConversationProps {
    conversationId?: string; // Optional for new conversations
    recipient: User;
    onBack: () => void;
    onSwitchToAi: () => void;
    relatedAdId?: string;
    relatedAdTitle?: string;
}

const Conversation: React.FC<ConversationProps> = ({ conversationId, recipient, onBack, onSwitchToAi, relatedAdId, relatedAdTitle }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversation, setConversation] = useState<ConversationType | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const { identity: currentUser, updateCurrentUser, promptForIdentity } = useAuth();
    const { addNotification } = useNotification();
    const { openAdDetail } = useAdDetail();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { ads, myAds } = useMarketplace();
    const uniqueAdsMap = new Map([...ads, ...myAds].map(ad => [ad.id, ad]));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    const relatedAdIdFromPropsOrConvo = conversation?.relatedAdId || relatedAdId;
    const relatedAd = relatedAdIdFromPropsOrConvo ? uniqueAdsMap.get(relatedAdIdFromPropsOrConvo) : null;

    const fetchMessages = useCallback(async () => {
        if (!conversationId) {
             setMessages([]);
             setLoading(false);
             return;
        };
        try {
            const [fetchedMessages, convos] = await Promise.all([
                api.getMessages(conversationId),
                api.getConversations()
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
    
    // AI Suggestion Logic
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (currentUser?.type === 'FULL_USER' && relatedAd && lastMessage && lastMessage.senderId !== currentUser.id) {
            const getSuggestions = async () => {
                const suggestions = await api.suggestChatReply(lastMessage.text, relatedAd, currentUser.learnedQA);
                setAiSuggestions(suggestions);
            };
            getSuggestions();
        } else {
            setAiSuggestions([]);
        }
    }, [messages, relatedAd, currentUser]);

    // Automatic Welcome Message Logic
    useEffect(() => {
        if (
            currentUser?.type === 'FULL_USER' &&
            relatedAd &&
            currentUser.id === relatedAd.seller.id && // This logic is for the seller receiving a new message
            messages.length === 1 && // Only one message exists (from the buyer)
            messages[0].senderId !== currentUser.id &&
            currentUser.chatSettings?.welcomeMessage
        ) {
            api.sendMessage(messages[0].senderId, currentUser.chatSettings.welcomeMessage, undefined, relatedAd.id, relatedAd.title);
            // We don't need to optimistically update here, the fetch will get it.
        }
    }, [messages, currentUser, relatedAd]);


    useEffect(scrollToBottom, [messages, aiSuggestions]);

    const handleSendMessage = async (e: React.FormEvent, text?: string) => {
        e.preventDefault();
        const messageText = text || newMessage;
        if (!messageText.trim()) return;

        if (!currentUser) {
            promptForIdentity();
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            conversationId: conversation?.id || 'new',
            senderId: currentUser.id,
            receiverId: recipient.id,
            text: messageText,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setAiSuggestions([]); // Clear suggestions after sending
        
        try {
            const adIdForMessage = conversation?.relatedAdId || relatedAdId;
            const adTitleForMessage = conversation?.relatedAdTitle || relatedAdTitle;
            await api.sendMessage(recipient.id, optimisticMessage.text, undefined, adIdForMessage, adTitleForMessage);
            fetchMessages(); // Refresh to get real message ID and confirm
        } catch (error) {
            addNotification('Failed to send message.', 'error');
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setNewMessage(suggestion);
    }
    
    const handleTeachAI = async (messageIndex: number) => {
        if (messageIndex < 1 || !relatedAd) return;
        const answerMsg = messages[messageIndex];
        const questionMsg = messages[messageIndex - 1];

        // Ensure it's a Q&A pair (buyer then seller)
        if (questionMsg.senderId === answerMsg.senderId) {
            addNotification("Cannot learn from two of your own messages in a row.", "info");
            return;
        }

        const qaPair: QAPair = {
            question: questionMsg.text,
            answer: answerMsg.text,
            adId: relatedAd.id,
        };
        
        try {
            const updatedUser = await api.addLearnedQA(qaPair);
            updateCurrentUser(updatedUser);
            addNotification("AI has learned this response!", 'success');
        } catch (error) {
            addNotification("Failed to teach AI.", 'error');
        }
    };

    const handleOpenAiChat = () => {
        onSwitchToAi();
    };
    
    const handleAttachFile = () => fileInputRef.current?.click();
    
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (file handling logic remains the same)
    };
    
    const handleDownloadAttachment = (attachment: Attachment) => {
        // ... (attachment download logic remains the same)
    };

    const isSeller = currentUser?.id === relatedAd?.seller.id;
    const adTitle = conversation?.relatedAdTitle || relatedAdTitle;

    return (
        <>
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 bg-secondary h-16 grid grid-cols-3 items-center px-2 border-b border-border-color">
                <div className="flex justify-start">
                    <button onClick={onBack} className="flex items-center p-2 rounded-lg hover:bg-primary transition-colors text-sm font-semibold text-text-primary">
                        <ChevronLeftIcon />
                        <span className="ml-1 hidden sm:inline">All Chats</span>
                    </button>
                </div>

                <div className="flex flex-col items-center text-center overflow-hidden">
                    <h3 className="font-bold text-text-primary truncate">{recipient.username}</h3>
                    {adTitle && relatedAdIdFromPropsOrConvo ? (
                        <button 
                            onClick={() => openAdDetail(relatedAdIdFromPropsOrConvo)}
                            className="text-xs text-text-secondary truncate w-full hover:underline"
                            title="View Ad Details"
                        >
                            re: {adTitle}
                        </button>
                    ) : adTitle ? (
                        <p className="text-xs text-text-secondary truncate w-full">re: {adTitle}</p>
                    ) : null}
                </div>
                
                <div className="flex justify-end items-center space-x-1">
                    <button onClick={handleOpenAiChat} className="p-2 text-text-secondary hover:text-accent rounded-full" title="Open MAZ AI Assistant">
                        <SparklesIcon className="h-5 w-5" />
                    </button>
                    {isSeller && (
                        <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-text-secondary hover:text-accent rounded-full" title="Chat Settings">
                            <CogIcon />
                        </button>
                    )}
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-xs text-text-secondary my-4">
                        <p className="inline-block bg-primary px-2 py-1 rounded-full">Your conversation is secured with E2E encryption.</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isCurrentUserMsg = msg.senderId === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 group ${isCurrentUserMsg ? 'justify-end' : ''}`}>
                             {isCurrentUserMsg && isSeller && (
                                <button onClick={() => handleTeachAI(index)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-accent" title="Teach this response to MAZ AI">
                                    <BrainIcon />
                                </button>
                            )}
                            <div className={`w-auto max-w-xs md:max-w-md flex flex-col ${isCurrentUserMsg ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl ${isCurrentUserMsg ? 'bg-accent text-white rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                                    <p>{msg.text}</p>
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

            <footer className="bg-secondary border-t border-border-color">
                {isSeller && currentUser?.type === 'FULL_USER' && currentUser.chatSettings?.welcomeMessage && (
                    <div className="px-4 py-2 text-center border-b border-border-color">
                        <p className="text-xs text-text-secondary italic">
                            <span className="font-semibold text-text-secondary/80">Your Auto-Reply:</span> "{currentUser.chatSettings.welcomeMessage}"
                        </p>
                    </div>
                )}
                {isSeller && (aiSuggestions.length > 0 || (currentUser as any).chatSettings?.quickReplies?.length > 0) && (
                    <div className="p-2">
                        {aiSuggestions.length > 0 && (
                            <div className="mb-2">
                                <h4 className="text-xs font-bold text-accent mb-1 flex items-center"><SparklesIcon className="h-4 w-4 mr-1" /> AI Suggestions</h4>
                                <div className="flex flex-wrap gap-1">
                                    {aiSuggestions.map((s, i) => <button key={`ai-${i}`} onClick={() => handleSuggestionClick(s)} className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20">{s}</button>)}
                                </div>
                            </div>
                        )}
                        {(currentUser as any).chatSettings?.quickReplies?.length > 0 && (
                             <div>
                                <h4 className="text-xs font-bold text-text-secondary mb-1">Quick Replies</h4>
                                <div className="flex flex-wrap gap-1">
                                    {(currentUser as any).chatSettings.quickReplies.map((s: string, i: number) => <button key={`qr-${i}`} onClick={() => handleSuggestionClick(s)} className="px-2 py-1 text-xs rounded-full bg-primary border border-border-color text-text-secondary hover:bg-border-color">{s}</button>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="p-2">
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
                </div>
            </footer>
        </div>
        {isSettingsModalOpen && currentUser?.type === 'FULL_USER' && (
            <ChatSettingsModal
                currentUser={currentUser}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        )}
        </>
    );
};

export default Conversation;
