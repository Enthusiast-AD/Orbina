import React, { useState } from 'react';
import { Icons } from './icons';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import toast from 'react-hot-toast';

const CallActions = ({ 
  userId, 
  userName, 
  isOnline = false, 
  className = "",
  size = "sm" 
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const { isOnline: currentUserOnline } = useOnlineStatus();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const handleCall = (type) => {
    if (!currentUserOnline) {
      toast.error('You need to be online to make calls');
      return;
    }

    if (!isOnline) {
      toast.error(`${userName} is currently offline`);
      return;
    }

    setIsCallActive(true);
    setCallType(type);
    
    // Simulate call initiation
    toast.success(`Calling ${userName}...`);
    
    // Simulate call connection after 3 seconds
    setTimeout(() => {
      toast.success(`Connected to ${userName}`);
    }, 3000);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallType(null);
    toast.success('Call ended');
  };

  if (isCallActive) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded-full text-white text-xs">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>{callType === 'video' ? 'Video Call' : 'Voice Call'}</span>
        </div>
        <button
          onClick={handleEndCall}
          className="p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
          title="End Call"
        >
          <Icons.PhoneOff className={sizeClasses[size]} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleCall('audio')}
        disabled={!isOnline || !currentUserOnline}
        className={`p-1 rounded-full transition-colors ${
          isOnline && currentUserOnline
            ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
            : 'text-gray-500 cursor-not-allowed'
        }`}
        title={
          !currentUserOnline 
            ? 'You are offline' 
            : !isOnline 
            ? `${userName} is offline` 
            : `Call ${userName}`
        }
      >
        <Icons.Phone className={sizeClasses[size]} />
      </button>
      
      <button
        onClick={() => handleCall('video')}
        disabled={!isOnline || !currentUserOnline}
        className={`p-1 rounded-full transition-colors ${
          isOnline && currentUserOnline
            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
            : 'text-gray-500 cursor-not-allowed'
        }`}
        title={
          !currentUserOnline 
            ? 'You are offline' 
            : !isOnline 
            ? `${userName} is offline` 
            : `Video call ${userName}`
        }
      >
        <Icons.VideoCall className={sizeClasses[size]} />
      </button>
    </div>
  );
};

export default CallActions;