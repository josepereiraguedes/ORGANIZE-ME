import React, { createContext, useEffect, useState, useCallback } from 'react';
import { 
  supabase, 
  getProducts, 
  addProduct as addProductService, 
  updateProduct as updateProductService, 
  deleteProduct as deleteProductService,
  getClients,
  addClient as addClientService,
  updateClient as updateClientService,
  deleteClient as deleteClientService,
  getTransactions,
  addTransaction as addTransactionService,
  updateTransactionStatus as updateTransactionStatusService,
  getFinancialSummary as getFinancialSummaryService
} from '../services/supabase';
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
  /** User ID for RLS */
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
  /** User ID for RLS */
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
  /** User ID for RLS */
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
 * Context type for the Supabase database operations
 */
interface SupabaseDatabaseContextType {
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

const SupabaseDatabaseContext = createContext<SupabaseDatabaseContextType | undefined>(undefined);

/**
 * Provider component for the Supabase database context
 * @param children - Child components that will have access to the context
 */
export const SupabaseDatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
   * Refresh all data from Supabase
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
      // Carregar dados do Supabase em paralelo
      const [productsData, clientsData, transactionsData] = await Promise.all([
        getProducts(userId),
        getClients(userId),
        getTransactions(userId)
      ]);
      
      setProducts(productsData || []);
      setClients(clientsData || []);
      setTransactions(transactionsData || []);
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
  }, [getCurrentUserId]);

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
      
      // Adicionar produto no Supabase
      const newProduct = await addProductService(productData, userId);
      
      // Atualizar estado local
      setProducts(prev => [...prev, newProduct]);
      
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
      
      // Atualizar produto no Supabase
      const updatedProduct = await updateProductService(id, productData, userId);
      
      // Atualizar estado local
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
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
      
      // Excluir produto no Supabase
      await deleteProductService(id, userId);
      
      // Atualizar estado local
      setProducts(prev => prev.filter(product => product.id !== id));
      
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
      
      // Adicionar cliente no Supabase
      const newClient = await addClientService(clientData, userId);
      
      // Atualizar estado local
      setClients(prev => [...prev, newClient]);
      
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
      
      // Atualizar cliente no Supabase
      const updatedClient = await updateClientService(id, clientData, userId);
      
      // Atualizar estado local
      setClients(prev => 
        prev.map(client => 
          client.id === id ? updatedClient : client
        )
      );
      
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
      
      // Excluir cliente no Supabase
      await deleteClientService(id, userId);
      
      // Atualizar estado local
      setClients(prev => prev.filter(client => client.id !== id));
      
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
      
      // Adicionar transação no Supabase
      const newTransaction = await addTransactionService(transactionData, userId);
      
      // Atualizar estado local
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Atualizar estoque do produto
      setProducts(prev => 
        prev.map(product => {
          if (product.id === transactionData.product_id) {
            let newQuantity = product.quantity;
            if (transactionData.type === 'sale') {
              newQuantity -= transactionData.quantity;
            } else if (transactionData.type === 'purchase') {
              newQuantity += transactionData.quantity;
            } else if (transactionData.type === 'adjustment') {
              newQuantity = transactionData.quantity;
            }
            return { ...product, quantity: newQuantity };
          }
          return product;
        })
      );
      
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
      
      // Atualizar status da transação no Supabase
      const updatedTransaction = await updateTransactionStatusService(id, status, userId);
      
      // Atualizar estado local
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? updatedTransaction : transaction
        )
      );
      
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
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Converter datas para strings no formato ISO
      const startDateStr = startDate ? startDate.toISOString() : undefined;
      const endDateStr = endDate ? endDate.toISOString() : undefined;
      
      // Obter resumo financeiro do Supabase
      const summary = await getFinancialSummaryService(userId, startDateStr, endDateStr);
      
      return summary;
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
    <SupabaseDatabaseContext.Provider value={{
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
    </SupabaseDatabaseContext.Provider>
  );
};

/**
 * Custom hook to use the Supabase database context
 * @returns Supabase database context
 * @throws Error if used outside of SupabaseDatabaseProvider
 */
export const useSupabaseDatabase = () => {
  const context = React.useContext(SupabaseDatabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseDatabase must be used within a SupabaseDatabaseProvider');
  }
  return context;
};

export default SupabaseDatabaseProvider;