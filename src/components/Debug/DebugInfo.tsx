import React, { useState, useEffect } from 'react';

const DebugInfo: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<Record<string, string | boolean | undefined>>({});

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Informações de Ambiente
      </h2>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {Object.entries(envInfo).map(([key, value]) => (
          <div key={key} className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="font-medium text-gray-900 dark:text-white">{key}:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInfo;