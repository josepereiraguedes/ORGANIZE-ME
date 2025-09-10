import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useSupabaseDatabase } from '../contexts/SupabaseDatabaseContext';
import { motion, HTMLMotionProps } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Sales: React.FC = () => {
  const { transactions, products, clients, updateTransactionStatus } = useSupabaseDatabase();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const handleStatusChange = async (id: number, currentStatus: 'paid' | 'pending') => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const promise = updateTransactionStatus(id, newStatus);
    
    toast.promise(promise, {
      loading: 'Atualizando status...',
      success: 'Status atualizado com sucesso!',
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
    { title: 'Receita (Paga)', value: `R$ ${financialSummary.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'green' },
    { title: 'Receita (Pendente)', value: `R$ ${financialSummary.pendingReceivables.toFixed(2)}`, icon: TrendingUp, color: 'yellow' },
    { title: 'Custos Totais', value: `R$ ${financialSummary.totalCosts.toFixed(2)}`, icon: TrendingDown, color: 'red' },
    { title: 'Lucro Líquido', value: `R$ ${financialSummary.profit.toFixed(2)}`, icon: DollarSign, color: financialSummary.profit >= 0 ? 'green' : 'red', change: `${financialSummary.profitMargin.toFixed(1)}%` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendas e Transações</h1>
        <Link to="/sales/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Nova Transação
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          {[{ value: 'all', label: 'Todos' }, { value: 'today', label: 'Hoje' }, { value: 'week', label: 'Última Semana' }, { value: 'month', label: 'Último Mês' }].map((period) => (
            <button key={period.value} onClick={() => setSelectedPeriod(period.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {financialCards.map((card, index) => (
          <div 
            key={card.title} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
            </div>
            {card.change && (
              <div className="mt-4">
                <span className={`text-sm ${card.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.title === 'Lucro Líquido' ? `Margem: ${card.change}` : card.change}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Transações</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => {
                const product = products.find(p => p.id === transaction.product_id);
                const client = clients.find(c => c.id === transaction.client_id);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product?.image ? <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-4" /> : <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md mr-4" />}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.type === 'sale' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {transaction.type === 'sale' ? 'Venda' : transaction.type === 'purchase' ? 'Compra' : 'Ajuste'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === 'sale' && (
                        <button
                          onClick={() => handleStatusChange(transaction.id!, transaction.payment_status)}
                          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-opacity hover:opacity-80 ${transaction.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {transaction.payment_status === 'paid' ? 'Pago' : 'A Pagar'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{client?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.quantity}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'sale' ? 'text-green-600' : transaction.type === 'purchase' ? 'text-red-600' : 'text-gray-500'}`}>
                      {transaction.type === 'sale' ? '+' : transaction.type === 'purchase' ? '-' : ''}R$ {transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(transaction.created_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada para o período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;