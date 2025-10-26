import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api';
import { useMarketplace } from '../../hooks/useMarketplace';
import { SendIcon } from '../../components/icons/SendIcon';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import MazdadyLogo from '../../components/ui/MazdadyLogo';

interface AiMessage {
    author: 'user' | 'ai';
    text: string;
}

const MazAiChat: React.FC = () => {
    const [messages, setMessages] = useState<AiMessage[]>([
        { author: 'ai', text: "Hello! I'm your MAZ AI assistant. Ask me anything about the marketplace, like 'what is the average price?' or 'show me electronics under $500'." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { ads } = useMarketplace();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: AiMessage = { author: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await api.parseAiCommand(input, ads);
            let aiResponse = "I'm not sure how to answer that. Try asking about items on the marketplace.";
            
            if (result.type === 'text_response') {
                aiResponse = result.payload;
            } else if (result.type === 'apply_filters' || result.type === 'apply_category_filter' || result.type === 'navigate') {
                aiResponse = result.message || "I've understood your command. I would now perform that action.";
            } else if (result.type === 'error') {
                aiResponse = result.payload;
            }
            
            const aiMessage: AiMessage = { author: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            const errorMessage: AiMessage = { author: 'ai', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const isUser = msg.author === 'user';
                    return (
                         <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser && (
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    <MazdadyLogo className="text-xl" />
                                </div>
                            )}
                            <div className={`w-auto max-w-xs md:max-w-md flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                {!isUser && (
                                    <span className="text-xs text-text-secondary mb-1 ml-3">MAZ AI</span>
                                )}
                                <div className={`px-4 py-2 rounded-2xl ${isUser ? 'bg-accent text-white rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            <MazdadyLogo className="text-xl" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-text-secondary mb-1 ml-3">MAZ AI</span>
                            <div className="px-4 py-2 rounded-2xl bg-secondary text-text-primary rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <SparklesIcon className="h-4 w-4 text-accent animate-pulse" />
                                    <span className="text-sm text-text-secondary">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 bg-secondary border-t border-border-color">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask MAZ AI..."
                        className="flex-1 bg-primary border border-border-color rounded-full py-2 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button type="submit" className="p-2 bg-accent text-white rounded-full hover:bg-accent-hover disabled:opacity-50" disabled={isLoading || !input.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default MazAiChat;
