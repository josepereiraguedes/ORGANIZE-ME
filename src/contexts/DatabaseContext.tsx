import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  category: string;
  cost: number;
  salePrice: number;
  quantity: number;
  supplier: string;
  minStock: number;
  image?: string; // Base64 encoded image
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  type: 'sale' | 'purchase' | 'adjustment';
  productId: number;
  clientId?: number;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentStatus: 'paid' | 'pending';
  description?: string;
  createdAt: Date;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  pendingReceivables: number;
}

class InventoryDB extends Dexie {
  products!: Table<Product>;
  clients!: Table<Client>;
  transactions!: Table<Transaction>;

  constructor() {
    super('InventoryDB');
    this.version(3).stores({
      products: '++id, name, category, cost, salePrice, quantity, supplier, minStock, image, createdAt, updatedAt',
      clients: '++id, name, email, phone, createdAt, updatedAt',
      transactions: '++id, type, productId, clientId, quantity, unitPrice, total, paymentStatus, description, createdAt'
    });
    this.on('populate', () => this.clients.add({
        name: 'Cliente Padrão',
        email: '',
        phone: '',
        address: '',
        createdAt: new Date(),
        updatedAt: new Date()
    }));
  }
}

interface DatabaseContextType {
  db: InventoryDB;
  products: Product[];
  clients: Client[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransactionStatus: (id: number, status: 'paid' | 'pending') => Promise<void>;
  getFinancialSummary: (startDate?: Date, endDate?: Date) => Promise<FinancialSummary>;
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db] = useState(new InventoryDB());
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refreshData = useCallback(async () => {
    const productsData = await db.products.toArray();
    const clientsData = await db.clients.toArray();
    const transactionsData = await db.transactions.toArray();
    setProducts(productsData.map(p => ({...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt)})));
    setClients(clientsData.map(c => ({...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt)})));
    setTransactions(transactionsData.map(t => ({...t, createdAt: new Date(t.createdAt)})));
  }, [db]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newProduct = {
      ...productData,
      createdAt: now,
      updatedAt: now
    };
    await db.products.add(newProduct);
    await refreshData();
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    const updatedData = {
      ...productData,
      updatedAt: new Date()
    };
    await db.products.update(id, updatedData);
    await refreshData();
  };

  const deleteProduct = async (id: number) => {
    await db.products.delete(id);
    await refreshData();
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newClient = {
      ...clientData,
      createdAt: now,
      updatedAt: now
    };
    await db.clients.add(newClient);
    await refreshData();
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    const updatedData = {
      ...clientData,
      updatedAt: new Date()
    };
    await db.clients.update(id, updatedData);
    await refreshData();
  };

  const deleteClient = async (id: number) => {
    await db.clients.delete(id);
    await refreshData();
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction = {
      ...transactionData,
      createdAt: new Date()
    };
    await db.transactions.add(newTransaction);

    // Update product stock
    const product = await db.products.get(transactionData.productId);
    if (product) {
      let newQuantity = Number(product.quantity);
      if (transactionData.type === 'sale') {
        newQuantity -= Number(transactionData.quantity);
      } else if (transactionData.type === 'purchase') {
        newQuantity += Number(transactionData.quantity);
      } else if (transactionData.type === 'adjustment') {
        newQuantity = Number(transactionData.quantity);
      }
      
      await updateProduct(transactionData.productId, { quantity: newQuantity });
    }

    await refreshData();
  };

  const updateTransactionStatus = async (id: number, status: 'paid' | 'pending') => {
    await db.transactions.update(id, { paymentStatus: status });
    await refreshData();
  };

  const getFinancialSummary = async (startDate?: Date, endDate?: Date): Promise<FinancialSummary> => {
    let filteredTransactions = await db.transactions.toArray();
    
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.createdAt);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
    }

    const paidSales = filteredTransactions.filter(t => t.type === 'sale' && t.paymentStatus === 'paid');
    const pendingSales = filteredTransactions.filter(t => t.type === 'sale' && t.paymentStatus === 'pending');
    const purchases = filteredTransactions.filter(t => t.type === 'purchase');

    const totalRevenue = paidSales.reduce((sum, t) => sum + t.total, 0);
    const pendingReceivables = pendingSales.reduce((sum, t) => sum + t.total, 0);
    const totalCosts = purchases.reduce((sum, t) => sum + t.total, 0);
    
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      pendingReceivables
    };
  };

  return (
    <DatabaseContext.Provider value={{
      db,
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
      refreshData
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
