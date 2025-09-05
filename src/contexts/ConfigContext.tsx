import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompanyConfig {
  name: string;
  logo?: string;
}

interface ConfigContextType {
  company: CompanyConfig;
  updateCompany: (config: CompanyConfig) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyConfig>(() => {
    const stored = localStorage.getItem('company-config');
    return stored ? JSON.parse(stored) : { name: 'Minha Empresa' };
  });

  useEffect(() => {
    localStorage.setItem('company-config', JSON.stringify(company));
  }, [company]);

  const updateCompany = (config: CompanyConfig) => {
    setCompany(config);
  };

  return (
    <ConfigContext.Provider value={{ company, updateCompany }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
