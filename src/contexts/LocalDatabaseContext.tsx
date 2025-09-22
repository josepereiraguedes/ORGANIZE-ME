import React, { createContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

/**
 * Interface representing a product in the system
 */
export interface Product {
  /** Unique identifier for the product */
  id?: number;
  /** Name of the product */
  name: string;
  /** Category of the product */
  category: string;
  /** Cost price of the product */
  cost: number;
  /** Sale price of the product */
  sale_price: number;
  /** Current quantity in stock */
  quantity: number;
  /** Supplier of the product */
  supplier: string;
  /** Minimum stock level before alerting */
  min_stock: number;
  /** Optional image URL for the product */
  image?: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** User ID for data isolation */
  user_id?: string;
}

/**
 * Interface representing a client in the system
 */
export interface Client {
  /** Unique identifier for the client */
  id?: number;
  /** Name of the client */
  name: string;
  /** Optional email address */
  email?: string;
  /** Optional phone number */
  phone?: string;
  /** Optional physical address */
  address?: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** User ID for data isolation */
  user_id?: string;
}

/**
 * Interface representing a transaction in the system
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id?: number;
  /** Type of transaction: sale, purchase, or adjustment */
  type: 'sale' | 'purchase' | 'adjustment';
  /** ID of the product involved in the transaction */
  product_id: number;
  /** Optional ID of the client (for sales) */
  client_id?: number;
  /** Quantity of products in the transaction */
  quantity: number;
  /** Unit price of the product */
  unit_price: number;
  /** Total value of the transaction */
  total: number;
  /** Payment status: paid or pending */
  payment_status: 'paid' | 'pending';
  /** Optional description of the transaction */
  description?: string;
  /** Creation timestamp */
  created_at: string;
  /** User ID for data isolation */
  user_id?: string;
  /** Product details (for display) */
  product?: {
    name: string;
  };
  /** Client details (for display) */
  client?: {
    name: string;
  };
}

/**
 * Interface representing financial summary data
 */
export interface FinancialSummary {
  /** Total revenue from paid sales */
  totalRevenue: number;
  /** Total costs from purchases */
  totalCosts: number;
  /** Net profit (revenue - costs) */
  profit: number;
  /** Profit margin as percentage */
  profitMargin: number;
  /** Total value of pending receivables */
  pendingReceivables: number;
}

/**
 * Context type for the local database operations
 */
interface LocalDatabaseContextType {
  /** Array of all products */
  products: Product[];
  /** Array of all clients */
  clients: Client[];
  /** Array of all transactions */
  transactions: Transaction[];
  /** Function to add a new product */
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  /** Function to update an existing product */
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  /** Function to delete a product */
  deleteProduct: (id: number) => Promise<void>;
  /** Function to add a new client */
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  /** Function to update an existing client */
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  /** Function to delete a client */
  deleteClient: (id: number) => Promise<void>;
  /** Function to add a new transaction */
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  /** Function to update transaction payment status */
  updateTransactionStatus: (id: number, status: 'paid' | 'pending') => Promise<void>;
  /** Function to get financial summary */
  getFinancialSummary: (startDate?: Date, endDate?: Date) => Promise<FinancialSummary>;
  /** Function to refresh all data */
  refreshData: () => Promise<void>;
  /** Loading state indicator */
  loading: boolean;
}

const LocalDatabaseContext = createContext<LocalDatabaseContextType | undefined>(undefined);

/**
 * Provider component for the local database context
 * @param children - Child components that will have access to the context
 */
export const LocalDatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Get current user ID from session
   */
  const getCurrentUserId = useCallback(() => {
    try {
      if (user && user.id) {
        return user.id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
      return null;
    }
  }, [user]);

  /**
   * Get data from localStorage with fallback to default value
   */
  const getFromLocalStorage = useCallback(function<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao obter ${key} do localStorage:`, error);
      return defaultValue;
    }
  }, []);

  /**
   * Save data to localStorage
   */
  const saveToLocalStorage = useCallback(function<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }, []);

  /**
   * Refresh all data from localStorage
   */
  const refreshData = useCallback(async () => {
    // Verificar se há um usuário autenticado
    const userId = getCurrentUserId();
    if (!userId) {
      // Não carregar dados se não houver usuário logado
      setProducts([]);
      setClients([]);
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    try {
      // Carregar dados do localStorage
      const storedProducts = getFromLocalStorage<Product[]>(`products_${userId}`, []);
      const storedClients = getFromLocalStorage<Client[]>(`clients_${userId}`, []);
      const storedTransactions = getFromLocalStorage<Transaction[]>(`transactions_${userId}`, []);
      
      setProducts(storedProducts);
      setClients(storedClients);
      setTransactions(storedTransactions);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, usar arrays vazios
      setProducts([]);
      setClients([]);
      setTransactions([]);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId, getFromLocalStorage]);

  // Efeito para carregar dados quando o componente monta ou quando o usuário muda
  useEffect(() => {
    refreshData();
  }, [refreshData, user]);

  /**
   * Add a new product
   */
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Criar novo produto com timestamps
      const newProduct: Product = {
        ...productData,
        id: Date.now(), // Usar timestamp como ID único
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      };
      
      // Atualizar estado local
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      saveToLocalStorage(`products_${userId}`, updatedProducts);
      
      toast.success('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
      throw error;
    }
  };

  /**
   * Update an existing product
   */
  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar produto
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            ...productData,
            updated_at: new Date().toISOString()
          };
        }
        return product;
      });
      
      // Atualizar estado local
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      saveToLocalStorage(`products_${userId}`, updatedProducts);
      
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    }
  };

  /**
   * Delete a product
   */
  const deleteProduct = async (id: number) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Excluir produto
      const updatedProducts = products.filter(product => product.id !== id);
      
      // Atualizar estado local
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      saveToLocalStorage(`products_${userId}`, updatedProducts);
      
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
      throw error;
    }
  };

  /**
   * Add a new client
   */
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Criar novo cliente com timestamps
      const newClient: Client = {
        ...clientData,
        id: Date.now(), // Usar timestamp como ID único
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      };
      
      // Atualizar estado local
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      
      // Salvar no localStorage
      saveToLocalStorage(`clients_${userId}`, updatedClients);
      
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente');
      throw error;
    }
  };

  /**
   * Update an existing client
   */
  const updateClient = async (id: number, clientData: Partial<Client>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar cliente
      const updatedClients = clients.map(client => {
        if (client.id === id) {
          return {
            ...client,
            ...clientData,
            updated_at: new Date().toISOString()
          };
        }
        return client;
      });
      
      // Atualizar estado local
      setClients(updatedClients);
      
      // Salvar no localStorage
      saveToLocalStorage(`clients_${userId}`, updatedClients);
      
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  };

  /**
   * Delete a client
   */
  const deleteClient = async (id: number) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Excluir cliente
      const updatedClients = clients.filter(client => client.id !== id);
      
      // Atualizar estado local
      setClients(updatedClients);
      
      // Salvar no localStorage
      saveToLocalStorage(`clients_${userId}`, updatedClients);
      
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  };

  /**
   * Add a new transaction
   */
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Criar nova transação com timestamps
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now(), // Usar timestamp como ID único
        created_at: new Date().toISOString(),
        user_id: userId
      };
      
      // Atualizar estado local
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      
      // Salvar no localStorage
      saveToLocalStorage(`transactions_${userId}`, updatedTransactions);
      
      // Atualizar estoque do produto se for venda ou compra
      if (transactionData.type === 'sale' || transactionData.type === 'purchase') {
        const updatedProducts = products.map(product => {
          if (product.id === transactionData.product_id) {
            let newQuantity = product.quantity;
            if (transactionData.type === 'sale') {
              newQuantity -= transactionData.quantity;
            } else if (transactionData.type === 'purchase') {
              newQuantity += transactionData.quantity;
            }
            return { ...product, quantity: newQuantity, updated_at: new Date().toISOString() };
          }
          return product;
        });
        
        // Atualizar produtos
        setProducts(updatedProducts);
        saveToLocalStorage(`products_${userId}`, updatedProducts);
      }
      
      toast.success('Transação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação');
      throw error;
    }
  };

  /**
   * Update transaction payment status
   */
  const updateTransactionStatus = async (id: number, status: 'paid' | 'pending') => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar status da transação
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.id === id) {
          return {
            ...transaction,
            payment_status: status,
            updated_at: new Date().toISOString()
          };
        }
        return transaction;
      });
      
      // Atualizar estado local
      setTransactions(updatedTransactions);
      
      // Salvar no localStorage
      saveToLocalStorage(`transactions_${userId}`, updatedTransactions);
      
      toast.success('Status da transação atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status da transação:', error);
      toast.error('Erro ao atualizar status da transação');
      throw error;
    }
  };

  /**
   * Get financial summary
   */
  const getFinancialSummary = async (startDate?: Date, endDate?: Date): Promise<FinancialSummary> => {
    try {
      // Filtrar transações por data se necessário
      let filteredTransactions = transactions;
      
      if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.created_at) >= startDate
        );
      }
      
      if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.created_at) <= endDate
        );
      }
      
      const paidSales = filteredTransactions.filter(t => t.type === 'sale' && t.payment_status === 'paid');
      const pendingSales = filteredTransactions.filter(t => t.type === 'sale' && t.payment_status === 'pending');
      const purchases = filteredTransactions.filter(t => t.type === 'purchase');
      
      const totalRevenue = paidSales.reduce((sum, t) => sum + (t.total || 0), 0);
      const pendingReceivables = pendingSales.reduce((sum, t) => sum + (t.total || 0), 0);
      const totalCosts = purchases.reduce((sum, t) => sum + (t.total || 0), 0);
      
      const profit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      
      return {
        totalRevenue,
        totalCosts,
        profit,
        profitMargin,
        pendingReceivables
      };
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      // Retornar valores padrão em caso de erro
      return {
        totalRevenue: 0,
        totalCosts: 0,
        profit: 0,
        profitMargin: 0,
        pendingReceivables: 0
      };
    }
  };

  return (
    <LocalDatabaseContext.Provider value={{
      products,
      clients,
      transactions,
      addProduct,
      updateProduct,
      deleteProduct,
      addClient,
      updateClient,
      deleteClient,
      addTransaction,
      updateTransactionStatus,
      getFinancialSummary,
      refreshData,
      loading
    }}>
      {children}
    </LocalDatabaseContext.Provider>
  );
};

/**
 * Custom hook to use the local database context
 * @returns Local database context
 * @throws Error if used outside of LocalDatabaseProvider
 */
export const useLocalDatabase = () => {
  const context = React.useContext(LocalDatabaseContext);
  if (context === undefined) {
    throw new Error('useLocalDatabase must be used within a LocalDatabaseProvider');
  }
  return context;
};

export default LocalDatabaseProvider;