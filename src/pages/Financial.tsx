import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Sales: React.FC = () => {
  const { transactions, products, clients, updateTransactionStatus } = useDatabase();
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

  const getFilteredTransactions = () => {
    const now = new Date();
    if (selectedPeriod === 'all') return transactions;

    const startOfPeriod = new Date();
    switch (selectedPeriod) {
      case 'today':
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case 'month':
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
      default:
        return transactions;
    }
    return transactions.filter(t => t.createdAt >= startOfPeriod);
  };

  const filteredTransactions = getFilteredTransactions();
  
  const paidSales = filteredTransactions.filter(t => t.type === 'sale' && t.paymentStatus === 'paid');
  const purchases = filteredTransactions.filter(t => t.type === 'purchase');

  const totalRevenue = paidSales.reduce((sum, t) => sum + t.total, 0);
  const totalCosts = purchases.reduce((sum, t) => sum + t.total, 0);
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const financialCards = [
    { title: 'Receita (Paga)', value: `R$ ${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'green' },
    { title: 'Custos Totais', value: `R$ ${totalCosts.toFixed(2)}`, icon: TrendingDown, color: 'red' },
    { title: 'Lucro Líquido', value: `R$ ${profit.toFixed(2)}`, icon: DollarSign, color: profit >= 0 ? 'green' : 'red', change: `${profitMargin.toFixed(1)}%` }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financialCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Transações</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.slice().reverse().map((transaction) => {
                const product = products.find(p => p.id === transaction.productId);
                const client = clients.find(c => c.id === transaction.clientId);
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
                          onClick={() => handleStatusChange(transaction.id!, transaction.paymentStatus)}
                          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-opacity hover:opacity-80 ${transaction.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {transaction.paymentStatus === 'paid' ? 'Pago' : 'A Pagar'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{client?.name || 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'sale' ? 'text-green-600' : transaction.type === 'purchase' ? 'text-red-600' : 'text-gray-500'}`}>
                      {transaction.type === 'sale' ? '+' : transaction.type === 'purchase' ? '-' : ''}R$ {transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(transaction.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
      </motion.div>
    </div>
  );
};

export default Sales;
