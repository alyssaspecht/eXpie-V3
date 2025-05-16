import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  minutes?: number;
  onClose: () => void;
}

export function ToastNotification({ message, minutes = 0, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide the toast after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed bottom-5 right-5 flex max-w-xs w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-10 w-10 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {minutes > 0 ? 'Time saved!' : message}
            </p>
            {minutes > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {message || `You just saved ${minutes} minute${minutes !== 1 ? 's' : ''}.`}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
