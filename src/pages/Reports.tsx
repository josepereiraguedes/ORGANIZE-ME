import React, { useState } from 'react';
import { Download, Package, TrendingUp } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const { products, transactions } = useDatabase();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const getFilteredTransactions = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return transactions.filter(t => t.createdAt >= startDate && t.createdAt <= endDate);
  };

  const getSalesReport = () => {
    const sales = getFilteredTransactions().filter(t => t.type === 'sale');
    const productSales = sales.reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const key = product.name;
        if (!acc[key]) {
          acc[key] = { name: product.name, quantity: 0, revenue: 0, profit: 0 };
        }
        acc[key].quantity += sale.quantity;
        acc[key].revenue += sale.total;
        acc[key].profit += sale.total - (Number(product.cost) * sale.quantity);
      }
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number; profit: number }>);

    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  };

  const getInventoryReport = () => {
    return products.map(product => ({
      name: product.name,
      category: product.category,
      currentStock: product.quantity,
      minStock: product.minStock,
      stockValue: (Number(product.quantity) || 0) * (Number(product.cost) || 0),
      saleValue: (Number(product.quantity) || 0) * (Number(product.salePrice) || 0),
      status: Number(product.quantity) <= Number(product.minStock) ? 'Baixo' : 'Normal'
    }));
  };

  const currentReportData = selectedReport === 'sales' ? getSalesReport() : getInventoryReport();

  const getChartData = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const textStyle = { color: isDark ? '#fff' : '#333' };
    const axisStyle = { axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } }, axisLabel: { color: isDark ? '#9ca3af' : '#6b7280' }};

    if (selectedReport === 'sales') {
      const salesData = currentReportData.slice(0, 10);
      return {
        title: { text: 'Top 10 Produtos Mais Vendidos', textStyle },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: salesData.map(item => item.name), axisLabel: { rotate: 45, ...axisStyle.axisLabel }, ...axisStyle },
        yAxis: { type: 'value', ...axisStyle },
        series: [{ name: 'Receita (R$)', data: salesData.map(item => item.revenue.toFixed(2)), type: 'bar', itemStyle: { color: '#3b82f6' } }]
      };
    } else {
      const lowStock = currentReportData.filter(item => item.status === 'Baixo').length;
      const normalStock = currentReportData.length - lowStock;
      return {
        title: { text: 'Status do Estoque', textStyle },
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        series: [{ name: 'Produtos', type: 'pie', data: [
          { value: normalStock, name: 'Estoque Normal', itemStyle: { color: '#10b981' } },
          { value: lowStock, name: 'Estoque Baixo', itemStyle: { color: '#ef4444' } }
        ]}]
      };
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const title = selectedReport === 'sales' ? 'Relatório de Vendas' : 'Relatório de Estoque';
      const period = `Período: ${format(new Date(dateRange.start), 'P', { locale: ptBR })} a ${format(new Date(dateRange.end), 'P', { locale: ptBR })}`;
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(period, 14, 30);

      const head = selectedReport === 'sales'
        ? [['Produto', 'Qtd Vendida', 'Receita (R$)', 'Lucro (R$)']]
        : [['Produto', 'Categoria', 'Estoque', 'Status', 'Valor Custo (R$)']];
      
      const body = selectedReport === 'sales'
        ? (currentReportData as Array<{name: string, quantity: number, revenue: number, profit: number}>).map(item => [item.name, item.quantity, item.revenue.toFixed(2), item.profit.toFixed(2)])
        : (currentReportData as Array<{name: string, category: string, currentStock: number, status: string, stockValue: number}>).map(item => [item.name, item.category, item.currentStock, item.status, item.stockValue.toFixed(2)]);

      autoTable(doc, { startY: 35, head, body });
      doc.save(`relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(currentReportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selectedReport === 'sales' ? 'Vendas' : 'Estoque');
      XLSX.writeFile(wb, `relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <div className="flex space-x-2">
          <button onClick={exportToPDF} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Download className="w-4 h-4 mr-2" /> PDF
          </button>
          <button onClick={exportToExcel} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Relatório</label>
            <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="sales">Relatório de Vendas</option>
              <option value="inventory">Relatório de Estoque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Inicial</label>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Final</label>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <ReactECharts 
          option={getChartData()} 
          style={{ height: '400px' }} 
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
          opts={{
            renderer: 'canvas',
            useDirtyRect: false,
            devicePixelRatio: window.devicePixelRatio,
            useCoarsePointer: true,
            useGPUAxis: true,
            pointerSize: 4,
            supportDirtyRect: false,
            eventMode: 'passive'
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          {selectedReport === 'sales' ? <TrendingUp className="w-5 h-5 mr-2" /> : <Package className="w-5 h-5 mr-2" />}
          {selectedReport === 'sales' ? 'Dados de Vendas' : 'Dados do Estoque'}
        </h3>
        <div className="overflow-x-auto">
          {selectedReport === 'sales' ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qtd Vendida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receita (R$)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lucro (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(currentReportData as Array<{name: string, quantity: number, revenue: number, profit: number}>).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">R$ {item.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">R$ {item.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estoque Atual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Custo (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(currentReportData as Array<{name: string, currentStock: number, status: string, stockValue: number}>).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.currentStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Baixo' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {item.stockValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
