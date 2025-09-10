import React, { useEffect, useState } from 'react';
import { useSupabaseDatabase } from '../../contexts/SupabaseDatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

const DataInfo: React.FC = () => {
  const { products, clients, transactions } = useSupabaseDatabase();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Só mostrar em ambiente de desenvolvimento ou quando solicitado
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const showDebug = localStorage.getItem('showDebugInfo') === 'true';
    
    if (isDev || showDebug) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            Informações de Dados
          </p>
          <div className="mt-2 text-sm">
            <p>User ID: <span className="font-mono text-xs">{user.id}</span></p>
            <p>Email: <span className="font-mono text-xs">{user.email}</span></p>
            <p>Produtos: {products.length}</p>
            <p>Clientes: {clients.length}</p>
            <p>Transações: {transactions.length}</p>
          </div>
          <div className="mt-2">
            <button 
              onClick={() => setIsVisible(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Ocultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInfo;