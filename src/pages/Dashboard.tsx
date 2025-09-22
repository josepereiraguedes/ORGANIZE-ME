import React, { useEffect, useState, useMemo } from 'react';
import { Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { FinancialSummary, useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { handleError } from '../utils/errorHandler';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { products, transactions, clients, getFinancialSummary } = useLocalDatabase();
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
    profitMargin: 0,
    pendingReceivables: 0,
  });

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const data = await getFinancialSummary();
        setFinancialData(data);
      } catch (error) {
        handleError(error, 'dashboard');
      }
    };
    loadFinancialData();
  }, [transactions, getFinancialSummary]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => Number(p.quantity) <= Number(p.min_stock));
  }, [products]);

  const totalProducts = useMemo(() => {
    return products.length;
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.sale_price) || 0)), 0);
  }, [products]);

  const statsCards = useMemo(() => [
    {
      title: 'Faturamento (Pago)',
      value: `R$ ${financialData.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Contas a Receber',
      value: `R$ ${financialData.pendingReceivables.toFixed(2)}`,
      icon: Clock,
      color: 'orange',
    },
    {
      title: 'Valor do Estoque',
      value: `R$ ${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Total de Produtos',
      value: totalProducts,
      icon: Package,
      color: 'blue',
    },
  ], [financialData, totalValue, totalProducts]);

  // Calcular vendas dos últimos 7 dias na ordem correta
  const last7DaysSales = useMemo(() => {
    const today = new Date();
    // Criar array com os últimos 7 dias na ordem correta (segunda a domingo)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      // Calcular os dias corretos da semana (segunda é 1, domingo é 0)
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + i;
      date.setDate(diff);
      return date;
    });

    return last7Days.map(day => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = transactions
        .filter(t => 
          t.type === 'sale' && 
          t.payment_status === 'paid' && // Apenas vendas pagas
          new Date(t.created_at) >= dayStart && 
          new Date(t.created_at) <= dayEnd
        )
        .reduce((sum, t) => sum + t.total, 0);

      // Formatar o dia da semana corretamente
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        date: weekdays[day.getDay()],
        sales: daySales
      };
    });
  }, [transactions]);

  // Precompute lookups for better performance
  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);
  
  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c]));
  }, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={
                `p-3 rounded-full ${
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  'bg-gray-100 dark:bg-gray-900'
                }`
              }>
                <stat.icon className={
                  `w-6 h-6 ${
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`
                } />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vendas dos Últimos 7 Dias
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {last7DaysSales.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{day.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {day.sales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Produtos com Estoque Baixo
          </h3>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Nenhum produto com estoque baixo</p>
            ) : (
              lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{product.quantity} restante(s)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mín: {product.min_stock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Últimas Movimentações
        </h3>
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
              {transactions.slice(-5).reverse().map((transaction) => {
                const product = productMap.get(transaction.product_id);
                const client = clientMap.get(transaction.client_id);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product?.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">{product?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'sale' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {transaction.type === 'sale' ? 'Venda' : transaction.type === 'purchase' ? 'Compra' : 'Ajuste'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === 'sale' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {transaction.payment_status === 'paid' ? 'Pago' : 'A Pagar'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {client?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      R$ {transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;