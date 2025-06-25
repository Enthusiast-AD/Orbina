import React from 'react';
import { Icons } from './icons';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const UserStatus = ({ 
  className = "", 
  showText = false, 
  size = "sm" 
}) => {
  const { isOnline, statusText } = useOnlineStatus();
  
  const sizeClasses = {
    xs: "w-2 h-2",
    sm: "w-3 h-3", 
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const StatusIcon = isOnline ? Icons.Online : Icons.Offline;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <StatusIcon className={sizeClasses[size]} />
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
          {statusText}
        </span>
      )}
    </div>
  );
};

export default UserStatus;