import React, { useState } from 'react';
import type { FullUser, ChatSettings } from '../../types';
import Modal from '../../components/ui/Modal';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../context/AuthContext';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { XMarkIcon } from '../../components/icons/XMarkIcon';

interface ChatSettingsModalProps {
    currentUser: FullUser;
    onClose: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ currentUser, onClose }) => {
    const { updateCurrentUser } = useAuth();
    const { addNotification } = useNotification();
    const [settings, setSettings] = useState<ChatSettings>(currentUser.chatSettings || {});
    const [newQuickReply, setNewQuickReply] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State for inline editing
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    
    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.updateChatSettings(settings);
            updateCurrentUser(updatedUser);
            addNotification('Chat settings saved!', 'success');
            onClose();
        } catch (error) {
            addNotification('Failed to save settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addQuickReply = () => {
        if (newQuickReply.trim()) {
            const updatedReplies = [...(settings.quickReplies || []), newQuickReply.trim()];
            setSettings(prev => ({ ...prev, quickReplies: updatedReplies }));
            setNewQuickReply('');
        }
    };
    
    const deleteQuickReply = (index: number) => {
        const updatedReplies = (settings.quickReplies || []).filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, quickReplies: updatedReplies }));
    };
    
    const handleEditStart = (index: number, text: string) => {
        setEditingIndex(index);
        setEditText(text);
    };

    const handleEditCancel = () => {
        setEditingIndex(null);
        setEditText('');
    };

    const handleEditSave = (index: number) => {
        if (!editText.trim()) {
            // If the user clears the text, treat it as a deletion
            deleteQuickReply(index);
        } else {
            const updatedReplies = [...(settings.quickReplies || [])];
            updatedReplies[index] = editText.trim();
            setSettings(prev => ({ ...prev, quickReplies: updatedReplies }));
        }
        setEditingIndex(null);
        setEditText('');
    };

    return (
        <Modal onClose={onClose} title="Chat Assistant Settings">
            <div className="space-y-6">
                <div>
                    <label htmlFor="welcome-msg" className="block text-sm font-medium text-text-secondary">Automatic Welcome Message</label>
                    <textarea 
                        id="welcome-msg"
                        rows={3}
                        value={settings.welcomeMessage || ''}
                        onChange={e => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        placeholder="e.g., Hello! Thanks for your interest."
                        className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent"
                    />
                    <p className="text-xs text-text-secondary mt-1">This message is sent automatically when a buyer starts a new conversation with you.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">Quick Replies</label>
                    <div className="mt-2 space-y-2">
                        {(settings.quickReplies || []).map((reply, index) => (
                            <div key={index} className="flex items-center space-x-2">
                               {editingIndex === index ? (
                                    <>
                                        <input 
                                            type="text"
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            autoFocus
                                            className="flex-1 bg-primary border border-accent rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent sm:text-sm"
                                        />
                                        <button type="button" onClick={() => handleEditSave(index)} className="p-2 text-green-500 rounded-full hover:bg-green-500/10">
                                            <CheckIcon />
                                        </button>
                                        <button type="button" onClick={handleEditCancel} className="p-2 text-red-500 rounded-full hover:bg-red-500/10">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </>
                               ) : (
                                    <>
                                        <p className="flex-1 text-sm bg-primary border border-border-color rounded-md px-3 py-2 min-h-[40px] flex items-center">{reply}</p>
                                        <button onClick={() => handleEditStart(index, reply)} className="p-2 text-text-secondary rounded-full hover:bg-secondary"><PencilIcon /></button>
                                        <button onClick={() => deleteQuickReply(index)} className="p-2 text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon /></button>
                                    </>
                               )}
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center space-x-2 mt-2">
                        <input 
                            type="text"
                            value={newQuickReply}
                            onChange={e => setNewQuickReply(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addQuickReply())}
                            placeholder="Add a new quick reply..."
                            className="flex-1 bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent"
                        />
                        <button type="button" onClick={addQuickReply} className="px-4 py-2 text-sm font-semibold rounded-md bg-accent text-white">+</button>
                    </div>
                </div>
                
                <div className="pt-4">
                    <button onClick={handleSave} disabled={loading} className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChatSettingsModal;
