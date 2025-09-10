import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserInfo: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('👤 Usuário logado:', user);
      console.log('🆔 User ID:', user.id);
      console.log('📧 Email:', user.email);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            Debug Info
          </p>
          <div className="mt-2 text-sm">
            <p>User ID: <span className="font-mono">{user.id}</span></p>
            <p>Email: <span className="font-mono">{user.email}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;