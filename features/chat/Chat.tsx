import React, { useState, useEffect, useCallback } from 'react';
import type { Conversation as ConversationType, User } from '../../types';
import * as api from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Conversation from './Conversation';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import MazAiChat from './MazAiChat';
import { ChatIcon } from '../../components/icons/ChatIcon';
import { SparklesIcon } from '../../components/icons/SparklesIcon';

type ChatView = 'list' | 'conversation' | 'ai';
type ActiveTab = 'messages' | 'ai';

interface ChatProps {
    payload?: {
        conversationId?: string;
        recipient?: User;
        relatedAdId?: string;
        relatedAdTitle?: string;
        initialTab?: ActiveTab;
    };
}

interface ActiveConversationContext {
    conversationId?: string;
    recipient: User;
    relatedAdId?: string;
    relatedAdTitle?: string;
}

const Chat: React.FC<ChatProps> = ({ payload }) => {
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { identity, promptForIdentity } = useAuth();

    const [view, setView] = useState<ChatView>('list');
    const [activeListTab, setActiveListTab] = useState<ActiveTab>('messages');
    const [activeConversationContext, setActiveConversationContext] = useState<ActiveConversationContext | null>(null);

    const fetchConversations = useCallback(async () => {
        if (!identity || identity.type !== 'FULL_USER') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const convos = await api.getConversations();
            setConversations(convos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [identity]);

    useEffect(() => {
        if (identity?.type === 'FULL_USER') {
            fetchConversations();
        } else if (!payload?.recipient) {
            promptForIdentity();
        } else {
             setLoading(false);
        }
    }, [identity, payload?.recipient, promptForIdentity, fetchConversations]);

    useEffect(() => {
        // Handle deep-linking from notifications or other components
        if (payload?.recipient) {
            setActiveConversationContext({
                conversationId: payload.conversationId,
                recipient: payload.recipient,
                relatedAdId: payload.relatedAdId,
                relatedAdTitle: payload.relatedAdTitle,
            });
            setView('conversation');
        } else if (payload?.initialTab === 'ai') {
            setActiveConversationContext(null); // No return context
            setView('ai');
        }
    }, [payload]);

    const handleSelectConversation = (convo: ConversationType) => {
        if (!identity || identity.type !== 'FULL_USER') return;

        const otherParticipantId = convo.participantIds.find(id => id !== identity.id);
        if (!otherParticipantId || !convo.participantDetails[otherParticipantId]) {
            console.error("Cannot open conversation due to missing participant details.");
            setError("Could not open conversation.");
            return;
        }

        setActiveConversationContext({
            conversationId: convo.id,
            recipient: convo.participantDetails[otherParticipantId],
            relatedAdId: convo.relatedAdId,
            relatedAdTitle: convo.relatedAdTitle,
        });
        setView('conversation');
    };

    const TabButton: React.FC<{
        tabName: ActiveTab;
        label: string;
        icon: React.ReactElement;
        onClick: () => void;
    }> = ({ tabName, label, icon, onClick }) => (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold border-b-2 transition-colors ${
                activeListTab === tabName
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    if (!identity) {
        if (payload?.recipient) {
             // Guest starting a new chat
            return (
                <Conversation 
                    recipient={payload.recipient} 
                    relatedAdId={payload.relatedAdId}
                    relatedAdTitle={payload.relatedAdTitle}
                    onBack={() => window.dispatchEvent(new CustomEvent('navigateTo', { detail: { view: 'marketplace' }}))}
                    onSwitchToAi={() => { /* No-op for guest, will be handled by send prompt */ }}
                />
            );
        }
        return (
            <div className="py-4 h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">Join the Conversation</h2>
                <p className="text-text-secondary mb-6">Create an identity to send and receive secure, E2E encrypted messages.</p>
                <button onClick={promptForIdentity} className="px-6 py-2 bg-accent text-white font-semibold rounded-full">Get Started</button>
            </div>
        );
    }
    
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

    if (view === 'conversation') {
        if (!activeConversationContext) return null; // Safeguard
        return (
            <Conversation
                key={activeConversationContext.conversationId || activeConversationContext.recipient.id}
                conversationId={activeConversationContext.conversationId}
                recipient={activeConversationContext.recipient}
                relatedAdId={activeConversationContext.relatedAdId}
                relatedAdTitle={activeConversationContext.relatedAdTitle}
                onBack={() => {
                    setActiveConversationContext(null);
                    setView('list');
                    fetchConversations();
                }}
                onSwitchToAi={() => setView('ai')}
            />
        );
    }

    if (view === 'ai') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-shrink-0 bg-secondary h-16 flex items-center px-2 border-b border-border-color">
                    {activeConversationContext ? (
                        <button onClick={() => setView('conversation')} className="flex items-center p-2 rounded-lg hover:bg-primary transition-colors text-sm font-semibold text-text-primary">
                            <ChevronLeftIcon />
                            <span className="ml-1">Back to Chat</span>
                        </button>
                    ) : (
                        <button onClick={() => setView('list')} className="flex items-center p-2 rounded-lg hover:bg-primary transition-colors text-sm font-semibold text-text-primary">
                            <ChevronLeftIcon />
                            <span className="ml-1">All Chats</span>
                        </button>
                    )}
                    <h3 className="font-bold text-text-primary text-center flex-1">MAZ AI Assistant</h3>
                    <div className="w-24"></div> {/* Spacer to center title */}
                </div>
                <MazAiChat />
            </div>
        );
    }
    
    // Default view: 'list'
    return (
        <div className="py-4 h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-border-color">
                <div className="flex">
                    <TabButton tabName="messages" label="Messages" icon={<ChatIcon className="h-5 w-5" />} onClick={() => setActiveListTab('messages')} />
                    <TabButton tabName="ai" label="MAZ AI" icon={<SparklesIcon className="h-5 w-5" />} onClick={() => {
                        setActiveConversationContext(null); // Clear any return context
                        setView('ai');
                    }} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                    <div className="space-y-2 p-4">
                        {conversations.map(convo => {
                            if (identity.type !== 'FULL_USER') return null;
                            const otherParticipantId = convo.participantIds.find(id => id !== identity.id);
                            if (!otherParticipantId || !convo.participantDetails[otherParticipantId]) return null;
                            const otherParticipant = convo.participantDetails[otherParticipantId];

                            return (
                                <button key={convo.id} onClick={() => handleSelectConversation(convo)} className="w-full text-left flex items-center p-3 bg-secondary rounded-lg border border-transparent hover:border-border-color transition-colors">
                                    <img src={otherParticipant.avatarUrl} alt={otherParticipant.username} className="w-12 h-12 rounded-full" />
                                    <div className="ml-4 flex-1">
                                        <p className="font-semibold text-text-primary">{otherParticipant.username}</p>
                                        <p className="text-sm text-text-secondary truncate">{convo.lastMessage?.text || 'No messages yet'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-secondary rounded-lg border border-border-color text-center p-4 m-4">
                        <ChatIcon className="h-16 w-16 text-text-secondary" />
                        <p className="mt-4 font-semibold text-text-primary">No Messages Yet</p>
                        <p className="mt-1 text-sm text-text-secondary">Start a conversation by contacting a seller on an ad.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
