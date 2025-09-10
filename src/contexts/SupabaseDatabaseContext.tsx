import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { handleSupabaseError } from '../utils/errorHandler';
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
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  /** Function to update an existing product */
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  /** Function to delete a product */
  deleteProduct: (id: number) => Promise<void>;
  /** Function to add a new client */
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  /** Function to update an existing client */
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  /** Function to delete a client */
  deleteClient: (id: number) => Promise<void>;
  /** Function to add a new transaction */
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
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
   * Refresh all data from the database
   */
  const refreshData = useCallback(async () => {
    if (!user) return; // Não carregar dados se não houver usuário
    
    setLoading(true);
    try {
      // Buscar produtos do usuário atual
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Buscar clientes do usuário atual
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Buscar transações do usuário atual
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

    } catch (error) {
      handleSupabaseError(error, 'refreshData', true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Refresh only products data
   */
  const refreshProducts = useCallback(async () => {
    if (!user) return; // Não carregar dados se não houver usuário
    
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      handleSupabaseError(error, 'refreshProducts', true);
    }
  }, [user]);

  /**
   * Refresh only clients data
   */
  const refreshClients = useCallback(async () => {
    if (!user) return; // Não carregar dados se não houver usuário
    
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (error) {
      handleSupabaseError(error, 'refreshClients', true);
    }
  }, [user]);

  /**
   * Refresh only transactions data
   */
  const refreshTransactions = useCallback(async () => {
    if (!user) return; // Não carregar dados se não houver usuário
    
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id) // Filtrar por usuário atual
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error) {
      handleSupabaseError(error, 'refreshTransactions', true);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('🔄 Carregando dados para o usuário:', user.id);
      refreshData();
    } else {
      console.log('🚫 Nenhum usuário logado, limpando dados');
      setProducts([]);
      setClients([]);
      setTransactions([]);
    }
  }, [refreshData, user]);

  /**
   * Add a new product to the database
   * @param productData - Product data without id, created_at, and updated_at
   */
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('➕ Adicionando produto para o usuário:', user?.id);
      const { error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          user_id: user?.id, // Adicionar o ID do usuário
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      await refreshProducts();
      toast.success('Produto adicionado com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'product');
      throw error;
    }
  };

  /**
   * Update an existing product in the database
   * @param id - ID of the product to update
   * @param productData - Partial product data to update
   */
  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id); // Garantir que o usuário só atualize seus próprios produtos
      
      if (error) throw error;
      await refreshProducts();
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'product');
      throw error;
    }
  };

  /**
   * Delete a product from the database
   * @param id - ID of the product to delete
   */
  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Garantir que o usuário só delete seus próprios produtos
      
      if (error) throw error;
      await refreshProducts();
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'product');
      throw error;
    }
  };

  /**
   * Add a new client to the database
   * @param clientData - Client data without id, created_at, and updated_at
   */
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          user_id: user?.id, // Adicionar o ID do usuário
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      await refreshClients();
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'client');
      throw error;
    }
  };

  /**
   * Update an existing client in the database
   * @param id - ID of the client to update
   * @param clientData - Partial client data to update
   */
  const updateClient = async (id: number, clientData: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id); // Garantir que o usuário só atualize seus próprios clientes
      
      if (error) throw error;
      await refreshClients();
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'client');
      throw error;
    }
  };

  /**
   * Delete a client from the database
   * @param id - ID of the client to delete
   */
  const deleteClient = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Garantir que o usuário só delete seus próprios clientes
      
      if (error) throw error;
      await refreshClients();
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'client');
      throw error;
    }
  };

  /**
   * Add a new transaction to the database
   * @param transactionData - Transaction data without id and created_at
   */
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user?.id, // Adicionar o ID do usuário
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;

      // Atualizar estoque do produto
      if (transactionData.type === 'sale' || transactionData.type === 'purchase' || transactionData.type === 'adjustment') {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', transactionData.product_id)
          .eq('user_id', user?.id) // Garantir que o usuário só acesse seus próprios produtos
          .single();
        
        if (productError) throw productError;

        let newQuantity = Number(productData.quantity);
        if (transactionData.type === 'sale') {
          newQuantity -= Number(transactionData.quantity);
        } else if (transactionData.type === 'purchase') {
          newQuantity += Number(transactionData.quantity);
        } else if (transactionData.type === 'adjustment') {
          newQuantity = Number(transactionData.quantity);
        }

        await supabase
          .from('products')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionData.product_id)
          .eq('user_id', user?.id); // Garantir que o usuário só atualize seus próprios produtos
      }

      await refreshTransactions();
      // Também precisamos atualizar os produtos pois o estoque pode ter mudado
      await refreshProducts();
      toast.success('Transação registrada com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'transaction');
      throw error;
    }
  };

  /**
   * Update transaction payment status
   * @param id - ID of the transaction to update
   * @param status - New payment status
   */
  const updateTransactionStatus = async (id: number, status: 'paid' | 'pending') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ payment_status: status })
        .eq('id', id)
        .eq('user_id', user?.id); // Garantir que o usuário só atualize suas próprias transações
      
      if (error) throw error;
      await refreshTransactions();
      toast.success('Status da transação atualizado com sucesso!');
    } catch (error) {
      handleSupabaseError(error, 'transaction');
      throw error;
    }
  };

  /**
   * Get financial summary for a date range
   * @param startDate - Start date for the summary (optional)
   * @param endDate - End date for the summary (optional)
   * @returns Financial summary data
   */
  const getFinancialSummary = async (startDate?: Date, endDate?: Date): Promise<FinancialSummary> => {
    try {
      let query = supabase.from('transactions').select('*');
      
      if (startDate || endDate) {
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
        if (endDate) {
          query = query.lte('created_at', endDate.toISOString());
        }
      }

      const { data: transactionsData, error } = await query;
      if (error) throw error;

      const filteredTransactions = transactionsData || [];
      
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
      handleSupabaseError(error, 'financialSummary');
      throw error;
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