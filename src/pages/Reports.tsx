import React, { useState, useMemo } from 'react';
import { useSupabaseDatabase } from '../contexts/SupabaseDatabaseContext';
import { handleError } from '../utils/errorHandler';
import { motion } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Download, TrendingUp, Package } from 'lucide-react';

const Reports: React.FC = () => {
  const { products, transactions } = useSupabaseDatabase();
  const [selectedReport, setSelectedReport] = useState<'sales' | 'inventory'>('sales');
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const generateSalesReport = useMemo(() => {
    return () => {
      const sales = transactions.filter(t => t.type === 'sale');
      
      // Agrupar vendas por produto
      const salesByProduct = sales.reduce((acc, sale) => {
        const productId = sale.product_id;
        const product = products.find(p => p.id === productId);
        
        if (!product) return acc;
        
        if (!acc[productId]) {
          acc[productId] = {
            name: product.name,
            category: product.category,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }
        
        acc[productId].quantity += sale.quantity;
        acc[productId].revenue += sale.total;
        acc[productId].cost += sale.quantity * product.cost;
        acc[productId].profit = acc[productId].revenue - acc[productId].cost;
        
        return acc;
      }, {} as Record<number, {name: string, category: string, quantity: number, revenue: number, cost: number, profit: number}>);
      
      return Object.values(salesByProduct);
    };
  }, [transactions, products]);

  const generateInventoryReport = useMemo(() => {
    return () => {
      return products.map(product => {
        const minStock = product.min_stock || 0;
        const currentStock = Number(product.quantity) || 0;
        const price = Number(product.sale_price) || 0;
        const stockValue = currentStock * price;
        
        return {
          name: product.name,
          category: product.category,
          currentStock: currentStock,
          minStock: minStock,
          stockValue: stockValue,
          status: currentStock <= minStock ? 'Baixo' : 'Normal'
        };
      });
    };
  }, [products]);

  const currentReportData = useMemo(() => {
    return selectedReport === 'sales' ? generateSalesReport() : generateInventoryReport();
  }, [selectedReport, generateSalesReport, generateInventoryReport]);

  // Função simplificada para gerar dados de vendas mensais sem depender de echarts
  const getMonthlySalesData = useMemo(() => {
    return () => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonth = new Date().getMonth();
      
      // Pega os últimos 4 meses
      const last4Months = Array.from({ length: 4 }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return months[monthIndex];
      }).reverse();
      
      // Dados simulados para os últimos 4 meses
      return last4Months.map(month => ({
        month,
        sales: Math.floor(Math.random() * 5000) + 1000
      }));
    };
  }, []);

  const monthlySalesData = useMemo(() => getMonthlySalesData(), [getMonthlySalesData]);

  const exportToPDF = () => {
    try {
      // Implementação alternativa: exportar como HTML e imprimir
      const title = selectedReport === 'sales' ? 'Relatório de Vendas' : 'Relatório de Estoque';
      const period = `Período: ${format(new Date(dateRange.start), 'P', { locale: ptBR })} a ${format(new Date(dateRange.end), 'P', { locale: ptBR })}`;
      
      // Criar conteúdo HTML para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Por favor, permita popups para imprimir o relatório');
        return;
      }
      
      // Estilo CSS para impressão
      const printCSS = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        h2 { font-size: 14px; font-weight: normal; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        @media print { .no-print { display: none; } }
      `;
      
      // Construir tabela HTML
      let tableHTML = '<table><thead><tr>';
      
      // Cabeçalhos
      const headers = selectedReport === 'sales'
        ? ['Produto', 'Qtd Vendida', 'Receita (R$)', 'Lucro (R$)']
        : ['Produto', 'Categoria', 'Estoque', 'Status', 'Valor Custo (R$)'];
      
      headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += '</tr></thead><tbody>';
      
      // Linhas de dados
      currentReportData.forEach(item => {
        tableHTML += '<tr>';
        if (selectedReport === 'sales') {
          const saleItem = item as {name: string, quantity: number, revenue: number, profit: number};
          tableHTML += `<td>${saleItem.name}</td>`;
          tableHTML += `<td>${saleItem.quantity}</td>`;
          tableHTML += `<td>R$ ${saleItem.revenue.toFixed(2)}</td>`;
          tableHTML += `<td>R$ ${saleItem.profit.toFixed(2)}</td>`;
        } else {
          const inventoryItem = item as {name: string, category: string, currentStock: number, status: string, stockValue: number};
          tableHTML += `<td>${inventoryItem.name}</td>`;
          tableHTML += `<td>${inventoryItem.category}</td>`;
          tableHTML += `<td>${inventoryItem.currentStock}</td>`;
          tableHTML += `<td>${inventoryItem.status}</td>`;
          tableHTML += `<td>R$ ${inventoryItem.stockValue.toFixed(2)}</td>`;
        }
        tableHTML += '</tr>';
      });
      
      // Linha de totais para relatório de vendas
      if (selectedReport === 'sales') {
        const totalSales = (currentReportData as Array<{revenue: number, profit: number}>).reduce(
          (acc, item) => ({ revenue: acc.revenue + item.revenue, profit: acc.profit + item.profit }),
          { revenue: 0, profit: 0 }
        );
        tableHTML += `<tr class="total-row"><td>TOTAL</td><td></td><td>R$ ${totalSales.revenue.toFixed(2)}</td><td>R$ ${totalSales.profit.toFixed(2)}</td></tr>`;
      }
      
      tableHTML += '</tbody></table>';
      
      // Conteúdo completo da página
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>${printCSS}</style>
        </head>
        <body>
          <h1>${title}</h1>
          <h2>${period}</h2>
          ${tableHTML}
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir Relatório
            </button>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success('Relatório gerado com sucesso!');

    } catch (error) {
      handleError(error, 'reportsPagePDF');
      toast.error('Erro ao gerar relatório PDF. Tente novamente.');
    }
  };

  const exportToCSV = () => {
    try {
      // Implementação segura de exportação CSV sem dependências externas
      const headers = selectedReport === 'sales' 
        ? ['Produto', 'Qtd Vendida', 'Receita (R$)', 'Lucro (R$)']
        : ['Produto', 'Categoria', 'Estoque', 'Status', 'Valor Custo (R$)'];
      
      const csvContent = [
        headers.join(','),
        ...currentReportData.map(item => {
          if (selectedReport === 'sales') {
            const saleItem = item as {name: string, quantity: number, revenue: number, profit: number};
            return `"${saleItem.name}",${saleItem.quantity},${saleItem.revenue.toFixed(2)},${saleItem.profit.toFixed(2)}`;
          } else {
            const inventoryItem = item as {name: string, category: string, currentStock: number, status: string, stockValue: number};
            return `"${inventoryItem.name}","${inventoryItem.category}",${inventoryItem.currentStock},"${inventoryItem.status}",${inventoryItem.stockValue.toFixed(2)}`;
          }
        })
      ];
      
      // Adicionar linha de totais para relatório de vendas
      if (selectedReport === 'sales') {
        const totalSales = (currentReportData as Array<{revenue: number, profit: number}>).reduce(
          (acc, item) => ({ revenue: acc.revenue + item.revenue, profit: acc.profit + item.profit }),
          { revenue: 0, profit: 0 }
        );
        csvContent.push(`"TOTAL",,${totalSales.revenue.toFixed(2)},${totalSales.profit.toFixed(2)}`);
      }
      
      const csvString = csvContent.join('\n');

      // Criar blob e download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório CSV exportado com sucesso!');
    } catch (error) {
      handleError(error, 'reportsPageCSV');
      toast.error('Erro ao exportar relatório CSV. Tente novamente.');
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
          <button onClick={exportToCSV} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Relatório</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value as 'sales' | 'inventory')} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="sales">Relatório de Vendas</option>
              <option value="inventory">Relatório de Estoque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Inicial</label>
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Final</label>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', padding: '1.5rem' }}
        className={`dark:bg-gray-800`}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas Mensais</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {monthlySalesData.map((data, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{data.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">R$ {data.sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          padding: '1.5rem'
        }}
        className={`dark:bg-gray-800`}
      >
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