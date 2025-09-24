import React, { createContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useConfig } from './ConfigContext';

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
  /** Subcategory of the product */
  subcategory?: string;
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
  products: Product[];
  clients: Client[];
  transactions: Transaction[];
  lowStockAlerts: Product[];
  // Adicionando categorias e subcategorias ao contexto
  categories: string[];
  subcategories: Record<string, string[]>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTransactionStatus: (id: number, status: 'paid' | 'pending') => Promise<void>;
  getFinancialSummary: (startDate?: Date, endDate?: Date) => Promise<FinancialSummary>;
  refreshData: () => Promise<void>;
  loading: boolean;
  // Funções para gerenciar categorias e subcategorias
  addCategory: (category: string) => Promise<void>;
  addSubcategory: (category: string, subcategory: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  updateSubcategory: (category: string, oldSubcategory: string, newSubcategory: string) => Promise<void>;
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
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
  // Estados para categorias e subcategorias
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { notifications } = useConfig();
  console.log('🔧 LocalDatabaseProvider - Usuário atual:', user);
  
  /**
   * Get current user ID from session
   */
  const getCurrentUserId = useCallback(() => {
    try {
      console.log('🆔 Tentando obter ID do usuário. Usuário no contexto:', user);
      if (user && user.id) {
        console.log('🆔 ID do usuário atual:', user.id);
        return user.id;
      }
      console.log(' erotik Nenhum usuário logado');
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
      console.log('📥 Obtendo dados do localStorage:', key);
      const item = localStorage.getItem(key);
      console.log('📄 Item bruto do localStorage:', item);
      if (item) {
        console.log('📄 Dados encontrados:', item.substring(0, 100) + '...');
        const parsed = JSON.parse(item);
        console.log('📄 Dados parseados:', parsed);
        return parsed;
      } else {
        console.log('📄 Nenhum dado encontrado para:', key);
        return defaultValue;
      }
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
      console.log('💾 Salvando dados no localStorage:', key, 'Valor:', value);
      console.log('💾 Tamanho dos dados:', JSON.stringify(value).length);
      localStorage.setItem(key, JSON.stringify(value));
      console.log('✅ Dados salvos com sucesso no localStorage:', key);
      
      // Verificar se os dados foram salvos corretamente
      const savedItem = localStorage.getItem(key);
      console.log('🔍 Verificação de salvamento:', key, 'Dados salvos:', savedItem?.substring(0, 100) + '...');
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
    console.log('🔄 RefreshData - UserID:', userId);
    
    if (!userId) {
      // Não carregar dados se não houver usuário logado
      console.log('❌ Não há usuário logado, limpando dados');
      setProducts([]);
      setClients([]);
      setTransactions([]);
      setCategories([]);
      setSubcategories({});
      return;
    }
    
    setLoading(true);
    try {
      // Carregar dados do localStorage
      console.log('📂 Carregando dados do localStorage para usuário:', userId);
      const storageKeyProducts = `products_${userId}`;
      const storageKeyClients = `clients_${userId}`;
      const storageKeyTransactions = `transactions_${userId}`;
      const storageKeyCategories = `categories_${userId}`;
      const storageKeySubcategories = `subcategories_${userId}`;
      
      console.log('🔑 Chaves de armazenamento:', {
        products: storageKeyProducts,
        clients: storageKeyClients,
        transactions: storageKeyTransactions,
        categories: storageKeyCategories,
        subcategories: storageKeySubcategories
      });
      
      const storedProducts = getFromLocalStorage<Product[]>(storageKeyProducts, []);
      const storedClients = getFromLocalStorage<Client[]>(storageKeyClients, []);
      const storedTransactions = getFromLocalStorage<Transaction[]>(storageKeyTransactions, []);
      const storedCategories = getFromLocalStorage<string[]>(storageKeyCategories, []);
      const storedSubcategories = getFromLocalStorage<Record<string, string[]>>(storageKeySubcategories, {});
      
      console.log('📦 Produtos carregados:', storedProducts.length);
      console.log('👥 Clientes carregados:', storedClients.length);
      console.log('💰 Transações carregadas:', storedTransactions.length);
      console.log('🏷️ Categorias carregadas:', storedCategories.length);
      console.log('📂 Subcategorias carregadas:', Object.keys(storedSubcategories).length);
      
      // Verificar se os dados pertencem ao usuário correto
      // REMOVIDO O FILTRO QUE PODIA ESTAR CAUSANDO PROBLEMAS
      // const userProducts = storedProducts.filter(p => p.user_id === userId || !p.user_id);
      // const userClients = storedClients.filter(c => c.user_id === userId || !c.user_id);
      // const userTransactions = storedTransactions.filter(t => t.user_id === userId || !t.user_id);
      
      console.log('🎯 Dados carregados diretamente sem filtro:', {
        products: storedProducts.length,
        clients: storedClients.length,
        transactions: storedTransactions.length,
        categories: storedCategories.length,
        subcategories: Object.keys(storedSubcategories).length
      });
      
      setProducts(storedProducts);
      setClients(storedClients);
      setTransactions(storedTransactions);
      setCategories(storedCategories);
      setSubcategories(storedSubcategories);
      
      // Verificar se os dados foram definidos corretamente no estado
      console.log('✅ Estado atualizado com os dados carregados');
    } catch (error) {
      console.error('💥 Erro ao carregar dados:', error);
      // Em caso de erro, usar arrays vazios
      setProducts([]);
      setClients([]);
      setTransactions([]);
      setCategories([]);
      setSubcategories({});
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId, getFromLocalStorage]);

  // Efeito para carregar dados quando o componente monta ou quando o usuário muda
  useEffect(() => {
    console.log('🔄 useEffect - Atualizando dados devido a mudança no usuário ou refreshData');
    console.log('👤 Usuário atual no contexto:', user);
    console.log('🔄 Chamando refreshData...');
    refreshData();
  }, [refreshData, user]);

  // Efeito para verificar estoque baixo
  useEffect(() => {
    const checkLowStock = () => {
      const lowStockProducts = products.filter(
        product => Number(product.quantity) <= Number(product.min_stock)
      );
      
      console.log('🔍 Verificando estoque baixo:', {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({name: p.name, quantity: p.quantity, min_stock: p.min_stock}))
      });
      
      // Notificar sobre produtos com estoque baixo se as notificações estiverem habilitadas
      if (notifications.lowStockAlerts && notifications.toastNotifications) {
        // Mostrar notificações apenas uma vez por produto
        const lowStockProductIds = lowStockProducts.map(p => p.id).filter(Boolean) as number[];
        const storageKey = `notified_low_stock_${user?.id || 'guest'}`;
        const notifiedProducts = JSON.parse(localStorage.getItem(storageKey) || '[]') as number[];
        
        lowStockProducts.forEach(product => {
          if (product.id && !notifiedProducts.includes(product.id)) {
            toast.error(`Estoque baixo: ${product.name} (${product.quantity} unidades)`, {
              duration: 6000,
              icon: '⚠️'
            });
          }
        });
        
        // Atualizar a lista de produtos notificados
        if (lowStockProductIds.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(lowStockProductIds));
        }
      }
      
      // Só atualizar o estado se houver uma mudança real
      setLowStockAlerts(prev => {
        // Verificar se os produtos com estoque baixo mudaram
        const hasChanged = prev.length !== lowStockProducts.length || 
          prev.some((p, i) => p.id !== lowStockProducts[i]?.id);
        
        if (hasChanged) {
          return lowStockProducts;
        }
        return prev;
      });
    };

    checkLowStock();
  }, [products, notifications.lowStockAlerts, notifications.toastNotifications, user?.id]);

  /**
   * Add a new product
   */
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Obter o ID do usuário logado
      const userId = getCurrentUserId();
      console.log('➕ Adicionando produto para usuário:', userId);
      
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
      
      console.log('🆕 Novo produto criado:', newProduct);
      
      // Atualizar estado local
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      const storageKey = `products_${userId}`;
      console.log('💾 Salvando produto no localStorage:', storageKey);
      console.log('📦 Produtos a serem salvos:', updatedProducts);
      saveToLocalStorage(storageKey, updatedProducts);
      
      // Verificar se os dados foram salvos corretamente
      const savedProducts = getFromLocalStorage<Product[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de produtos:', savedProducts);
      
      toast.success('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao adicionar produto:', error);
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
      console.log('✏️ Atualizando produto:', id, 'para usuário:', userId);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar produto
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          console.log('🔄 Atualizando produto existente:', product);
          return {
            ...product,
            ...productData,
            updated_at: new Date().toISOString()
          };
        }
        return product;
      });
      
      console.log('📦 Produtos atualizados:', updatedProducts);
      
      // Atualizar estado local
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      const storageKey = `products_${userId}`;
      console.log('💾 Salvando produtos atualizados no localStorage:', storageKey);
      saveToLocalStorage(storageKey, updatedProducts);
      
      // Verificar se os dados foram salvos corretamente
      const savedProducts = getFromLocalStorage<Product[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de produtos atualizados:', savedProducts);
      
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao atualizar produto:', error);
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
      console.log('🗑️ Excluindo produto:', id, 'para usuário:', userId);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Excluir produto
      const updatedProducts = products.filter(product => product.id !== id);
      
      console.log('📦 Produtos após exclusão:', updatedProducts);
      
      // Atualizar estado local
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      const storageKey = `products_${userId}`;
      console.log('💾 Salvando produtos após exclusão no localStorage:', storageKey);
      saveToLocalStorage(storageKey, updatedProducts);
      
      // Verificar se os dados foram salvos corretamente
      const savedProducts = getFromLocalStorage<Product[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de produtos após exclusão:', savedProducts);
      
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao excluir produto:', error);
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
      console.log('👥 Adicionando cliente para usuário:', userId);
      
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
      
      console.log('🆕 Novo cliente criado:', newClient);
      
      // Atualizar estado local
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      
      // Salvar no localStorage
      const storageKey = `clients_${userId}`;
      console.log('💾 Salvando cliente no localStorage:', storageKey);
      console.log('👥 Clientes a serem salvos:', updatedClients);
      saveToLocalStorage(storageKey, updatedClients);
      
      // Verificar se os dados foram salvos corretamente
      const savedClients = getFromLocalStorage<Client[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de clientes:', savedClients);
      
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao adicionar cliente:', error);
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
      console.log('✏️ Atualizando cliente:', id, 'para usuário:', userId);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar cliente
      const updatedClients = clients.map(client => {
        if (client.id === id) {
          console.log('🔄 Atualizando cliente existente:', client);
          return {
            ...client,
            ...clientData,
            updated_at: new Date().toISOString()
          };
        }
        return client;
      });
      
      console.log('👥 Clientes atualizados:', updatedClients);
      
      // Atualizar estado local
      setClients(updatedClients);
      
      // Salvar no localStorage
      const storageKey = `clients_${userId}`;
      console.log('💾 Salvando clientes atualizados no localStorage:', storageKey);
      saveToLocalStorage(storageKey, updatedClients);
      
      // Verificar se os dados foram salvos corretamente
      const savedClients = getFromLocalStorage<Client[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de clientes atualizados:', savedClients);
      
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao atualizar cliente:', error);
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
      console.log('🗑️ Excluindo cliente:', id, 'para usuário:', userId);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Excluir cliente
      const updatedClients = clients.filter(client => client.id !== id);
      
      console.log('👥 Clientes após exclusão:', updatedClients);
      
      // Atualizar estado local
      setClients(updatedClients);
      
      // Salvar no localStorage
      const storageKey = `clients_${userId}`;
      console.log('💾 Salvando clientes após exclusão no localStorage:', storageKey);
      saveToLocalStorage(storageKey, updatedClients);
      
      // Verificar se os dados foram salvos corretamente
      const savedClients = getFromLocalStorage<Client[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de clientes após exclusão:', savedClients);
      
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao excluir cliente:', error);
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
      console.log('💰 Adicionando transação para usuário:', userId);
      
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
      
      console.log('🆕 Nova transação criada:', newTransaction);
      
      // Atualizar estado local
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      
      // Salvar no localStorage
      const storageKey = `transactions_${userId}`;
      console.log('💾 Salvando transação no localStorage:', storageKey);
      console.log('💰 Transações a serem salvas:', updatedTransactions);
      saveToLocalStorage(storageKey, updatedTransactions);
      
      // Verificar se os dados foram salvos corretamente
      const savedTransactions = getFromLocalStorage<Transaction[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de transações:', savedTransactions);
      
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
        const productStorageKey = `products_${userId}`;
        console.log('💾 Atualizando produtos no localStorage:', productStorageKey);
        saveToLocalStorage(productStorageKey, updatedProducts);
        
        // Verificar se os produtos foram salvos corretamente
        const savedProducts = getFromLocalStorage<Product[]>(productStorageKey, []);
        console.log('🔍 Verificação de salvamento de produtos após transação:', savedProducts);
      }
      
      toast.success('Transação registrada com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao registrar transação:', error);
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
      console.log('💳 Atualizando status da transação:', id, 'para usuário:', userId, 'novo status:', status);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar status da transação
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.id === id) {
          console.log('🔄 Atualizando status da transação existente:', transaction);
          return {
            ...transaction,
            payment_status: status,
            updated_at: new Date().toISOString()
          };
        }
        return transaction;
      });
      
      console.log('💰 Transações atualizadas:', updatedTransactions);
      
      // Atualizar estado local
      setTransactions(updatedTransactions);
      
      // Salvar no localStorage
      const storageKey = `transactions_${userId}`;
      console.log('💾 Salvando transações atualizadas no localStorage:', storageKey);
      saveToLocalStorage(storageKey, updatedTransactions);
      
      // Verificar se os dados foram salvos corretamente
      const savedTransactions = getFromLocalStorage<Transaction[]>(storageKey, []);
      console.log('🔍 Verificação de salvamento de transações atualizadas:', savedTransactions);
      
      toast.success('Status da transação atualizado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao atualizar status da transação:', error);
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

  // Funções para gerenciar categorias e subcategorias
  const addCategory = async (category: string) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se a categoria já existe
      if (categories.includes(category)) {
        throw new Error('Categoria já existe');
      }
      
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      
      // Salvar no localStorage
      const storageKey = `categories_${userId}`;
      saveToLocalStorage(storageKey, updatedCategories);
      
      toast.success('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao adicionar categoria:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar categoria');
      throw error;
    }
  };

  const addSubcategory = async (category: string, subcategory: string) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se a categoria existe
      if (!categories.includes(category)) {
        throw new Error('Categoria não encontrada');
      }
      
      // Verificar se a subcategoria já existe para esta categoria
      const categorySubcategories = subcategories[category] || [];
      if (categorySubcategories.includes(subcategory)) {
        throw new Error('Subcategoria já existe nesta categoria');
      }
      
      const updatedSubcategories = {
        ...subcategories,
        [category]: [...categorySubcategories, subcategory]
      };
      
      setSubcategories(updatedSubcategories);
      
      // Salvar no localStorage
      const storageKey = `subcategories_${userId}`;
      saveToLocalStorage(storageKey, updatedSubcategories);
      
      toast.success('Subcategoria adicionada com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao adicionar subcategoria:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar subcategoria');
      throw error;
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se a nova categoria já existe (e não é a mesma que a antiga)
      if (newCategory !== oldCategory && categories.includes(newCategory)) {
        throw new Error('Categoria já existe');
      }
      
      // Atualizar categorias
      const updatedCategories = categories.map(cat => cat === oldCategory ? newCategory : cat);
      setCategories(updatedCategories);
      
      // Atualizar subcategorias (mover subcategorias da categoria antiga para a nova)
      const categorySubcategories = subcategories[oldCategory] || [];
      const updatedSubcategories = { ...subcategories };
      
      if (newCategory !== oldCategory) {
        // Mover subcategorias da categoria antiga para a nova
        updatedSubcategories[newCategory] = categorySubcategories;
        delete updatedSubcategories[oldCategory];
      }
      
      setSubcategories(updatedSubcategories);
      
      // Atualizar produtos que usam esta categoria
      const updatedProducts = products.map(product => {
        if (product.category === oldCategory) {
          return { ...product, category: newCategory };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      
      // Salvar tudo no localStorage
      const categoriesStorageKey = `categories_${userId}`;
      const subcategoriesStorageKey = `subcategories_${userId}`;
      const productsStorageKey = `products_${userId}`;
      
      saveToLocalStorage(categoriesStorageKey, updatedCategories);
      saveToLocalStorage(subcategoriesStorageKey, updatedSubcategories);
      saveToLocalStorage(productsStorageKey, updatedProducts);
      
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao atualizar categoria:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar categoria');
      throw error;
    }
  };

  const updateSubcategory = async (category: string, oldSubcategory: string, newSubcategory: string) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se a categoria existe
      if (!categories.includes(category)) {
        throw new Error('Categoria não encontrada');
      }
      
      // Verificar se a nova subcategoria já existe (e não é a mesma que a antiga)
      const categorySubcategories = subcategories[category] || [];
      if (newSubcategory !== oldSubcategory && categorySubcategories.includes(newSubcategory)) {
        throw new Error('Subcategoria já existe nesta categoria');
      }
      
      // Atualizar subcategorias
      const updatedCategorySubcategories = categorySubcategories.map(sub => 
        sub === oldSubcategory ? newSubcategory : sub
      );
      
      const updatedSubcategories = {
        ...subcategories,
        [category]: updatedCategorySubcategories
      };
      
      setSubcategories(updatedSubcategories);
      
      // Atualizar produtos que usam esta subcategoria
      const updatedProducts = products.map(product => {
        if (product.category === category && product.subcategory === oldSubcategory) {
          return { ...product, subcategory: newSubcategory };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      
      // Salvar tudo no localStorage
      const subcategoriesStorageKey = `subcategories_${userId}`;
      const productsStorageKey = `products_${userId}`;
      
      saveToLocalStorage(subcategoriesStorageKey, updatedSubcategories);
      saveToLocalStorage(productsStorageKey, updatedProducts);
      
      toast.success('Subcategoria atualizada com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao atualizar subcategoria:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar subcategoria');
      throw error;
    }
  };

  return (
    <LocalDatabaseContext.Provider value={{
      products,
      clients,
      transactions,
      lowStockAlerts,
      categories,
      subcategories,
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
      loading,
      addCategory,
      addSubcategory,
      updateCategory,
      updateSubcategory
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