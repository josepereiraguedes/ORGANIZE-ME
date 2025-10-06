import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { motion, HTMLMotionProps } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Sales: React.FC = () => {
  const { transactions, products, clients, updateTransactionStatus } = useLocalDatabase();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const handleStatusChange = async (id: number, currentStatus: 'paid' | 'pending') => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const promise = updateTransactionStatus(id, newStatus);
    
    toast.promise(promise, {
      loading: 'Atualizando status...',
      success: 'Status atualizado!',
      error: 'Erro ao atualizar status.',
    });
  };

  const getStartOfPeriod = useMemo(() => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return new Date(weekStart.setHours(0, 0, 0, 0));
      }
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0);
    }
  }, [selectedPeriod]);

  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return transactions;
    
    const startOfPeriod = getStartOfPeriod;
    return transactions.filter(t => new Date(t.created_at) >= startOfPeriod);
  }, [transactions, selectedPeriod, getStartOfPeriod]);

  const paidSales = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'sale' && t.payment_status === 'paid');
  }, [filteredTransactions]);

  const pendingSales = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'sale' && t.payment_status === 'pending');
  }, [filteredTransactions]);

  const purchases = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'purchase');
  }, [filteredTransactions]);

  // Calcular os custos totais com base no custo real dos produtos vendidos
  const totalCosts = useMemo(() => {
    let costs = 0;
    
    // Para transações de compra, somar o valor total
    purchases.forEach(transaction => {
      costs += transaction.total || 0;
    });
    
    return costs;
  }, [purchases]);

  // Calcular os custos reais das vendas com base no custo dos produtos
  const actualSalesCosts = useMemo(() => {
    let costs = 0;
    
    // Para transações de venda, calcular o custo real dos produtos vendidos
    paidSales.forEach(transaction => {
      const product = products.find(p => p.id === transaction.product_id);
      if (product) {
        // Calcular o custo real: custo do produto * quantidade vendida
        costs += product.cost * transaction.quantity;
      }
    });
    
    return costs;
  }, [paidSales, products]);

  const financialSummary = useMemo(() => {
    const totalRevenue = paidSales.reduce((sum, t) => sum + (t.total || 0), 0);
    const pendingReceivables = pendingSales.reduce((sum, t) => sum + (t.total || 0), 0);
    // Usar o custo real das vendas em vez do valor total das compras
    const costs = actualSalesCosts;
    const profit = totalRevenue - costs;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      pendingReceivables,
      totalCosts: costs,
      profit,
      profitMargin
    };
  }, [paidSales, pendingSales, actualSalesCosts]);

  const financialCards = [
    { 
      title: 'Receita', 
      value: `R$ ${financialSummary.totalRevenue.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'green',
      subtitle: 'Vendas pagas'
    },
    { 
      title: 'A Receber', 
      value: `R$ ${financialSummary.pendingReceivables.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'yellow',
      subtitle: 'Vendas pendentes'
    },
    { 
      title: 'Custos', 
      value: `R$ ${financialSummary.totalCosts.toFixed(2)}`, 
      icon: TrendingDown, 
      color: 'red',
      subtitle: 'Custo dos produtos'
    },
    { 
      title: 'Lucro', 
      value: `R$ ${financialSummary.profit.toFixed(2)}`, 
      icon: DollarSign, 
      color: financialSummary.profit >= 0 ? 'green' : 'red',
      subtitle: `${financialSummary.profitMargin.toFixed(1)}% de margem`
    }
  ];

  // Precompute lookups for better performance
  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);
  
  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c]));
  }, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financeiro
        </h1>
        <Link 
          to="/sales/new" 
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Nova Transação
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {[{ value: 'all', label: 'Todos' }, { value: 'today', label: 'Hoje' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mês' }].map((period) => (
            <button 
              key={period.value} 
              onClick={() => setSelectedPeriod(period.value)} 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedPeriod === period.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {financialCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            {...({ className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4" } as HTMLMotionProps<'div'>)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div className={
                `p-2 rounded-lg ${
                  card.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  card.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  card.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-gray-100 dark:bg-gray-700'
                }`
              }>
                <card.icon className={
                  `w-5 h-5 ${
                    card.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    card.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    card.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`
                } />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Histórico de Transações */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Histórico de Transações
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Cliente</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Quantidade</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Tipo</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Total</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const product = productMap.get(transaction.product_id);
                  const client = clientMap.get(transaction.client_id);
                  return (
                    <tr 
                      key={transaction.id} 
                      className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                    >
                      <td className="py-3">
                        <div className="flex items-center">
                          {product?.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-8 h-8 object-cover rounded-md mr-2" 
                            /> 
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md mr-2" />
                          )}
                          <span className="text-gray-900 dark:text-white truncate max-w-[80px]">
                            {product?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {client?.name || 'N/A'}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {transaction.quantity}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'sale' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : transaction.type === 'purchase' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {transaction.type === 'sale' ? 'Venda' : transaction.type === 'purchase' ? 'Compra' : 'Ajuste'}
                        </span>
                      </td>
                      <td className="py-3">
                        {transaction.type === 'sale' && (
                          <button
                            onClick={() => handleStatusChange(transaction.id!, transaction.payment_status)}
                            className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-opacity hover:opacity-80 ${
                              transaction.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {transaction.payment_status === 'paid' ? 'Pago' : 'A Pagar'}
                          </button>
                        )}
                      </td>
                      <td className={`py-3 font-medium ${
                        transaction.type === 'sale' 
                          ? 'text-green-600' 
                          : transaction.type === 'purchase' 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {transaction.type === 'sale' ? '+' : transaction.type === 'purchase' ? '-' : ''}
                        R$ {transaction.total.toFixed(2)}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {format(transaction.created_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <DollarSign className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma transação encontrada
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;