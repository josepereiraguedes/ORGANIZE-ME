import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        {user.user_metadata?.avatar_url ? (
          <img 
            className="h-8 w-8 rounded-full" 
            src={user.user_metadata.avatar_url} 
            alt="Avatar" 
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.user_metadata?.full_name || user.email}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
      </div>
      <button
        onClick={() => signOut()}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
      >
        Sair
      </button>
    </div>
  );
};

export default UserProfile;