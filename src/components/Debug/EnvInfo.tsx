import React, { useState, useEffect } from 'react';

const EnvInfo: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<Record<string, string | boolean | undefined>>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Coletar informações de ambiente
    setEnvInfo({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 10) + '...' : 
        undefined,
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL
    });
  }, []);

  if (!showInfo) {
    return (
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={() => setShowInfo(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Mostrar Informações de Ambiente
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informações de Ambiente</h3>
        <button 
          onClick={() => setShowInfo(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Ocultar
        </button>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {Object.entries(envInfo).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="font-medium">{key}:</span> {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvInfo;