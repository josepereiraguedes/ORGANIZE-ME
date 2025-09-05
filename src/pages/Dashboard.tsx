import React, { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, AlertTriangle, Users, Clock } from 'lucide-react';
import { useDatabase, FinancialSummary } from '../contexts/DatabaseContext';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  const { products, transactions, clients, getFinancialSummary } = useDatabase();
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
    profitMargin: 0,
    pendingReceivables: 0,
  });

  useEffect(() => {
    const loadFinancialData = async () => {
      const data = await getFinancialSummary();
      setFinancialData(data);
    };
    loadFinancialData();
  }, [transactions, getFinancialSummary]);

  const lowStockProducts = products.filter(p => Number(p.quantity) <= Number(p.minStock));
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.salePrice) || 0)), 0);

  const statsCards = [
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
  ];

  const getChartOption = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const salesByDay = last7Days.map(day => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      return transactions
        .filter(t => t.type === 'sale' && t.createdAt >= dayStart && t.createdAt <= dayEnd)
        .reduce((sum, t) => sum + t.total, 0);
    });

    return {
      title: {
        text: 'Vendas dos Últimos 7 Dias',
        textStyle: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#333'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: last7Days.map(d => d.toLocaleDateString('pt-BR', { weekday: 'short' })),
        axisLine: {
          lineStyle: {
            color: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'
          }
        },
        axisLabel: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'
          }
        },
        axisLabel: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        }
      },
      series: [{
        data: salesByDay.map(s => s.toFixed(2)),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }]
          }
        }
      }]
    };
  };

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
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <ReactECharts option={getChartOption()} style={{ height: '300px' }} theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mín: {product.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                const product = products.find(p => p.id === transaction.productId);
                const client = clients.find(c => c.id === transaction.clientId);
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
                          transaction.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {transaction.paymentStatus === 'paid' ? 'Pago' : 'A Pagar'}
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
                      {transaction.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
