import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { ConfigProvider } from './contexts/ConfigContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Financial';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProductForm from './components/Inventory/ProductForm';
import TransactionForm from './components/Financial/TransactionForm';
import Clients from './pages/Clients';
import ClientForm from './components/Clients/ClientForm';

function App() {
  return (
    <DatabaseProvider>
      <ConfigProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/new" element={<ProductForm />} />
                  <Route path="/inventory/edit/:id" element={<ProductForm />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/sales/new" element={<TransactionForm />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/new" element={<ClientForm />} />
                  <Route path="/clients/edit/:id" element={<ClientForm />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  className: 'dark:bg-gray-800 dark:text-white',
                }}
              />
            </div>
          </Router>
        </ThemeProvider>
      </ConfigProvider>
    </DatabaseProvider>
  );
}

export default App;
