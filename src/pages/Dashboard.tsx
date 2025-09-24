import React, { useEffect, useState, useMemo } from 'react';
import { Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { FinancialSummary, useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { handleError } from '../utils/errorHandler';
import { motion, HTMLMotionProps } from 'framer-motion';
import LowStockAlerts from '../components/Inventory/LowStockAlerts';
import CategoryStats from '../components/Inventory/CategoryStats';

const Dashboard: React.FC = () => {
  const { products, transactions, clients, getFinancialSummary, lowStockAlerts } = useLocalDatabase();
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

  const totalProducts = useMemo(() => {
    return products.length;
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.sale_price) || 0)), 0);
  }, [products]);

  const statsCards = useMemo(() => [
    {
      title: 'Faturamento',
      value: `R$ ${financialData.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'purple',
      subtitle: 'Vendas pagas'
    },
    {
      title: 'A Receber',
      value: `R$ ${financialData.pendingReceivables.toFixed(2)}`,
      icon: Clock,
      color: 'orange',
      subtitle: 'Contas pendentes'
    },
    {
      title: 'Valor Estoque',
      value: `R$ ${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      subtitle: 'Valor total'
    },
    {
      title: 'Produtos',
      value: totalProducts,
      icon: Package,
      color: 'blue',
      subtitle: 'Itens no estoque'
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Atualizado: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Alerta de Estoque Baixo */}
      {lowStockAlerts.length > 0 && (
        <LowStockAlerts limit={3} />
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            {...({ className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4" } as HTMLMotionProps<'div'>)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={
                `p-2 rounded-lg ${
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-gray-100 dark:bg-gray-700'
                }`
              }>
                <stat.icon className={
                  `w-5 h-5 ${
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`
                } />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas dos Últimos 7 Dias */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Vendas dos Últimos 7 Dias
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Vendas pagas
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Dia</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Vendas</th>
                </tr>
              </thead>
              <tbody>
                {last7DaysSales.map((day, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-2 text-gray-900 dark:text-white">{day.date}</td>
                    <td className="py-2 text-gray-900 dark:text-white">R$ {day.sales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estatísticas por Categoria */}
        <div className="space-y-6">
          <CategoryStats />
          
          {/* Produtos com Estoque Baixo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Estoque Baixo
            </h3>
            <div className="space-y-3">
              {lowStockAlerts.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estoque ok</p>
                </div>
              ) : (
                lowStockAlerts.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded-md mr-3" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-red-600">{product.quantity}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">mín: {product.min_stock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Movimentações */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Últimas Movimentações
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
              {transactions.slice(-5).reverse().map((transaction) => {
                const product = productMap.get(transaction.product_id);
                const client = clientMap.get(transaction.client_id);
                return (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center">
                        {product?.image ? (
                          <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded-md mr-2" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md mr-2 flex items-center justify-center">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-gray-900 dark:text-white truncate max-w-[80px]">{product?.name || 'N/A'}</span>
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
                        transaction.type === 'sale' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {transaction.type === 'sale' ? 'Venda' : transaction.type === 'purchase' ? 'Compra' : 'Ajuste'}
                      </span>
                    </td>
                    <td className="py-3">
                      {transaction.type === 'sale' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {transaction.payment_status === 'paid' ? 'Pago' : 'A Pagar'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white">
                      R$ {transaction.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">
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