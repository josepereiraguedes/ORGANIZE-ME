import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LocalDatabaseProvider } from './contexts/LocalDatabaseContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <ThemeProvider>
          <LocalDatabaseProvider>
            <AppContent />
          </LocalDatabaseProvider>
        </ThemeProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;