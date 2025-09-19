import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseDatabaseProvider } from './contexts/SupabaseDatabaseContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <ThemeProvider>
          <SupabaseDatabaseProvider>
            <AppContent />
          </SupabaseDatabaseProvider>
        </ThemeProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;