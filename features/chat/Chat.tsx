import React, { useState, useEffect, useCallback } from 'react';
import type { Conversation as ConversationType, User } from '../../types';
import * as api from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Conversation from './Conversation';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

interface ChatProps {
    // If navigating from an ad, pre-select a conversation
    initialConversationId?: string;
    initialRecipient?: User;
}

const Chat: React.FC<ChatProps> = ({ initialConversationId, initialRecipient }) => {
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { identity, promptForIdentity } = useAuth();
    
    // When starting a new chat, we need the recipient info
    const [activeRecipient, setActiveRecipient] = useState<User | null>(initialRecipient || null);

    const fetchConversations = useCallback(async () => {
        if (!identity || identity.type !== 'FULL_USER') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const convos = await api.getConversations();
            setConversations(convos);
            if (initialConversationId) {
                const initialConvo = convos.find(c => c.id === initialConversationId);
                if (initialConvo) {
                    setSelectedConversation(initialConvo);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [initialConversationId, identity]);

    useEffect(() => {
        if (identity) {
            fetchConversations();
        } else {
            // Prompt for identity if a guest tries to access chat
            promptForIdentity();
        }
    }, [fetchConversations, identity, promptForIdentity]);

    const handleSelectConversation = (convo: ConversationType) => {
        if (!identity || identity.type !== 'FULL_USER') return;

        const otherParticipantId = convo.participantIds.find(id => id !== identity.id);

        if (!otherParticipantId || !convo.participantDetails[otherParticipantId]) {
            console.error("Cannot open conversation due to missing participant details.", convo);
            setError("Could not open conversation. Data might be corrupted.");
            return;
        }

        setActiveRecipient(convo.participantDetails[otherParticipantId]);
        setSelectedConversation(convo);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setActiveRecipient(null);
        // Refresh conversation list to show the latest message
        fetchConversations();
    };

    if (!identity) {
        return (
            <div className="py-4 h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">Join the Conversation</h2>
                <p className="text-text-secondary mb-6">Create an identity to send and receive secure, E2E encrypted messages.</p>
                <button onClick={promptForIdentity} className="px-6 py-2 bg-accent text-white font-semibold rounded-full">Get Started</button>
            </div>
        );
    }
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    if (error) {
        return <div className="text-center text-red-500 mt-8">{error}</div>;
    }

    if (selectedConversation && activeRecipient) {
        return (
            <Conversation 
                conversationId={selectedConversation.id} 
                recipient={activeRecipient} 
                onBack={handleBackToList}
            />
        );
    }
    
     if (!selectedConversation && activeRecipient) {
        // This handles the case where we start a new chat but don't have a convo object yet
        return <Conversation recipient={activeRecipient} onBack={handleBackToList} />;
    }

    return (
        <div className="py-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">Messages</h2>
            {conversations.length > 0 ? (
                <div className="space-y-2">
                    {conversations.map(convo => {
                        if (identity.type !== 'FULL_USER') return null;

                        const otherParticipantId = convo.participantIds.find(id => id !== identity?.id);
                        
                        // Defensive check to prevent crash on corrupted data
                        if (!otherParticipantId || !convo.participantDetails[otherParticipantId]) {
                            console.warn("Skipping rendering of conversation with incomplete data:", convo);
                            return null;
                        }
                        
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
                <div className="flex-1 flex flex-col items-center justify-center bg-secondary rounded-lg border border-border-color text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p className="mt-4 font-semibold text-text-primary">No Messages Yet</p>
                    <p className="mt-1 text-sm text-text-secondary">Start a conversation by contacting a seller on an ad.</p>
                </div>
            )}
        </div>
    );
};

export default Chat;