import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');

  if (!user) return null;

  // Extrair o nome e e-mail dos metadados do usuário
  const userName = user.user_metadata?.name || 'Usuário';
  const userEmail = user.email || '';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        
        // Atualizar o perfil do usuário com a nova foto
        try {
          await updateUser(user.id, { avatar_url: result });
        } catch (error) {
          console.error('Erro ao atualizar avatar:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      await updateUser(user.id, { avatar_url: avatarUrl });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 relative">
        {avatarUrl ? (
          <img 
            className="h-8 w-8 rounded-full" 
            src={avatarUrl} 
            alt="Avatar" 
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        )}
        {isEditing && (
          <div className="absolute -bottom-2 -right-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer bg-blue-500 rounded-full p-1 w-5 h-5 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </label>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {userName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {userEmail}
        </p>
      </div>
      <div className="flex space-x-2">
        {isEditing ? (
          <button
            onClick={handleSaveAvatar}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
          >
            Salvar
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            Editar
          </button>
        )}
        <button
          onClick={() => signOut()}
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default UserProfile;