import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseDatabaseProvider } from './contexts/SupabaseDatabaseContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <SupabaseDatabaseProvider>
        <ConfigProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </ConfigProvider>
      </SupabaseDatabaseProvider>
    </AuthProvider>
  );
}

export default App;
