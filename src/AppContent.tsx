import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import LoginForm from './components/Auth/LoginForm';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar formulário de login
  if (!user) {
    return <LoginForm />;
  }

  // Se estiver autenticado, mostrar a aplicação principal
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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
  );
};

export default AppContent;