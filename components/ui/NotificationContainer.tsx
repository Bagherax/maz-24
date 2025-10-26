import React from 'react';
import { NotificationProvider } from '../../context/NotificationContext';

type NotificationType = 'info' | 'success' | 'error';

interface NotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  onDismiss: (id: string) => void;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const typeClasses: { [key in NotificationType]: { bg: string; text: string; icon: React.ReactElement } } = {
  info: { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  success: { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  error: { 
    bg: 'bg-red-500', 
    text: 'text-white',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
};

const Notification: React.FC<NotificationProps> = ({ id, message, type, onDismiss }) => {
  const classes = typeClasses[type];

  return (
    <div className={`flex items-center p-3 rounded-lg shadow-lg ${classes.bg} ${classes.text}`}>
      <div className="flex-shrink-0">{classes.icon}</div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button onClick={() => onDismiss(id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex hover:bg-white/20 transition-colors">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
};


const NotificationContainer: React.FC = () => {
  // Access the state and setter directly from the Provider's static properties
  const notifications = NotificationProvider._notifications || [];
  const setNotifications = NotificationProvider._setNotifications;

  if (!setNotifications) return null;

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {notifications.map(n => (
        <Notification key={n.id} {...n} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default NotificationContainer;