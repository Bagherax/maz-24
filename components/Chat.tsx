import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="py-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Messages</h2>
      <div className="flex-1 flex flex-col items-center justify-center bg-secondary rounded-lg border border-border-color text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="mt-4 font-semibold text-text-primary">Real-time Notifications</p>
        <p className="mt-1 text-text-secondary">P2P chat and live auctions coming soon.</p>
        <p className="text-xs text-text-secondary/70 mt-2">(Powered by Notification Service: WebSocket + Redis Pub/Sub)</p>
      </div>
    </div>
  );
};

export default Chat;