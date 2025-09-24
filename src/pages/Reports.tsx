import React, { useState, useMemo } from 'react';
import { useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { handleError } from '../utils/errorHandler';
import { motion, HTMLMotionProps } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Download, TrendingUp, Package, Receipt } from 'lucide-react';

const Reports: React.FC = () => {
  const { products, transactions } = useLocalDatabase();
  const [selectedReport, setSelectedReport] = useState<'sales' | 'inventory'>('sales');
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const generateSalesReport = useMemo(() => {
    return () => {
      // Filtrar transações pelo período selecionado
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Final do dia

      const sales = transactions.filter(t => 
        t.type === 'sale' && 
        new Date(t.created_at) >= startDate && 
        new Date(t.created_at) <= endDate
      );
      
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
        
        const saleCost = sale.quantity * product.cost;
        acc[productId].quantity += sale.quantity;
        acc[productId].revenue += sale.total;
        acc[productId].cost += saleCost;
        acc[productId].profit = acc[productId].revenue - acc[productId].cost;
        
        return acc;
      }, {} as Record<number, {name: string, category: string, quantity: number, revenue: number, cost: number, profit: number}>);
      
      return Object.values(salesByProduct);
    };
  }, [transactions, products, dateRange]);

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

  // Função corrigida para obter dados reais de vendas mensais
  const getMonthlySalesData = useMemo(() => {
    return () => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Filtrar transações pelo período selecionado
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      // Agrupar vendas por mês
      const monthlySales: Record<string, { name: string; sales: number }> = {};
      
      transactions
        .filter(t => 
          t.type === 'sale' && 
          t.payment_status === 'paid' && // Apenas vendas pagas
          new Date(t.created_at) >= startDate && 
          new Date(t.created_at) <= endDate
        )
        .forEach(transaction => {
          const date = new Date(transaction.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          const monthName = months[date.getMonth()];
          
          if (!monthlySales[monthKey]) {
            monthlySales[monthKey] = { name: monthName, sales: 0 };
          }
          
          monthlySales[monthKey].sales += transaction.total;
        });

      // Converter para array ordenado
      return Object.values(monthlySales);
    };
  }, [transactions, dateRange]);

  const monthlySalesData = useMemo(() => getMonthlySalesData(), [getMonthlySalesData]);

  const exportToPDF = () => {
    try {
      // Implementação alternativa: exportar como HTML e imprimir
      const title = selectedReport === 'sales' ? 'Relatório de Vendas' : 'Relatório de Estoque';
      const period = `Período: ${format(new Date(dateRange.start), 'P', { locale: ptBR })} a ${format(new Date(dateRange.end), 'P', { locale: ptBR })}`;
      
      // Criar conteúdo HTML para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Permita popups para imprimir');
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
        ? ['Produto', 'Categoria', 'Qtd Vendida', 'Receita (R$)', 'Custo (R$)', 'Lucro (R$)', 'Margem (%)']
        : ['Produto', 'Categoria', 'Estoque', 'Status', 'Valor Custo (R$)'];
      
      headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += '</tr></thead><tbody>';
      
      // Linhas de dados
      currentReportData.forEach(item => {
        tableHTML += '<tr>';
        if (selectedReport === 'sales') {
          const saleItem = item as {name: string, category: string, quantity: number, revenue: number, cost: number, profit: number};
          const margin = saleItem.revenue > 0 ? (saleItem.profit / saleItem.revenue) * 100 : 0;
          tableHTML += `<td>${saleItem.name}</td>`;
          tableHTML += `<td>${saleItem.category}</td>`;
          tableHTML += `<td>${saleItem.quantity}</td>`;
          tableHTML += `<td>R$ ${saleItem.revenue.toFixed(2)}</td>`;
          tableHTML += `<td>R$ ${saleItem.cost.toFixed(2)}</td>`;
          tableHTML += `<td>R$ ${saleItem.profit.toFixed(2)}</td>`;
          tableHTML += `<td>${margin.toFixed(1)}%</td>`;
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
        const totalSales = (currentReportData as Array<{revenue: number, cost: number, profit: number}>).reduce(
          (acc, item) => ({ revenue: acc.revenue + item.revenue, cost: acc.cost + item.cost, profit: acc.profit + item.profit }),
          { revenue: 0, cost: 0, profit: 0 }
        );
        const totalMargin = totalSales.revenue > 0 ? (totalSales.profit / totalSales.revenue) * 100 : 0;
        tableHTML += `<tr class="total-row"><td colspan="2">TOTAL</td><td></td><td>R$ ${totalSales.revenue.toFixed(2)}</td><td>R$ ${totalSales.cost.toFixed(2)}</td><td>R$ ${totalSales.profit.toFixed(2)}</td><td>${totalMargin.toFixed(1)}%</td></tr>`;
      }
      
      tableHTML += '</tbody></table>';
      
      // Adicionar tabela de detalhamento de transações para relatório de vendas
      if (selectedReport === 'sales') {
        // Filtrar transações de venda pelo período selecionado
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        const salesTransactions = transactions.filter(t => 
          t.type === 'sale' && 
          new Date(t.created_at) >= startDate && 
          new Date(t.created_at) <= endDate
        );
        
        if (salesTransactions.length > 0) {
          tableHTML += '<h2 style="margin-top: 30px; font-size: 16px;">Detalhamento de Transações</h2>';
          tableHTML += '<table><thead><tr>';
          tableHTML += '<th>Data</th><th>Produto</th><th>Qtd</th><th>Receita (R$)</th><th>Custo (R$)</th><th>Lucro (R$)</th><th>Margem (%)</th><th>Status</th>';
          tableHTML += '</tr></thead><tbody>';
          
          salesTransactions.forEach(transaction => {
            const product = products.find(p => p.id === transaction.product_id);
            if (product) {
              const transactionCost = transaction.quantity * product.cost;
              const transactionProfit = transaction.total - transactionCost;
              const transactionMargin = transaction.total > 0 ? (transactionProfit / transaction.total) * 100 : 0;
              
              tableHTML += '<tr>';
              tableHTML += `<td>${format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>`;
              tableHTML += `<td>${product.name}</td>`;
              tableHTML += `<td>${transaction.quantity}</td>`;
              tableHTML += `<td>R$ ${transaction.total.toFixed(2)}</td>`;
              tableHTML += `<td>R$ ${transactionCost.toFixed(2)}</td>`;
              tableHTML += `<td>R$ ${transactionProfit.toFixed(2)}</td>`;
              tableHTML += `<td>${transactionMargin.toFixed(1)}%</td>`;
              tableHTML += `<td>${transaction.payment_status === 'paid' ? 'Pago' : 'Pendente'}</td>`;
              tableHTML += '</tr>';
            }
          });
          
          tableHTML += '</tbody></table>';
        }
      }
      
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
      toast.success('Relatório gerado!');

    } catch (error) {
      handleError(error, 'reportsPagePDF');
      toast.error('Erro ao gerar relatório');
    }
  };

  const exportToCSV = () => {
    try {
      // Implementação segura de exportação CSV sem dependências externas
      let csvContent = [];
      
      if (selectedReport === 'sales') {
        // Cabeçalhos para relatório de vendas
        csvContent.push(['Produto', 'Categoria', 'Qtd Vendida', 'Receita (R$)', 'Custo (R$)', 'Lucro (R$)', 'Margem (%)'].join(','));
        
        // Dados agregados
        currentReportData.forEach(item => {
          const saleItem = item as {name: string, category: string, quantity: number, revenue: number, cost: number, profit: number};
          const margin = saleItem.revenue > 0 ? (saleItem.profit / saleItem.revenue) * 100 : 0;
          csvContent.push([
            `"${saleItem.name}"`,
            `"${saleItem.category}"`,
            saleItem.quantity,
            saleItem.revenue.toFixed(2),
            saleItem.cost.toFixed(2),
            saleItem.profit.toFixed(2),
            margin.toFixed(1)
          ].join(','));
        });
        
        // Linha de totais
        const totalSales = (currentReportData as Array<{revenue: number, cost: number, profit: number}>).reduce(
          (acc, item) => ({ revenue: acc.revenue + item.revenue, cost: acc.cost + item.cost, profit: acc.profit + item.profit }),
          { revenue: 0, cost: 0, profit: 0 }
        );
        const totalMargin = totalSales.revenue > 0 ? (totalSales.profit / totalSales.revenue) * 100 : 0;
        csvContent.push([
          '"TOTAL"',
          '""',
          '""',
          totalSales.revenue.toFixed(2),
          totalSales.cost.toFixed(2),
          totalSales.profit.toFixed(2),
          totalMargin.toFixed(1)
        ].join(','));
        
        // Separador
        csvContent.push('');
        csvContent.push(['DETALHAMENTO DE TRANSAÇÕES'].join(','));
        csvContent.push([''].join(','));
        
        // Cabeçalhos do detalhamento
        csvContent.push(['Data', 'Produto', 'Qtd', 'Receita (R$)', 'Custo (R$)', 'Lucro (R$)', 'Margem (%)', 'Status'].join(','));
        
        // Filtrar transações de venda pelo período selecionado
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        const salesTransactions = transactions.filter(t => 
          t.type === 'sale' && 
          new Date(t.created_at) >= startDate && 
          new Date(t.created_at) <= endDate
        );
        
        // Dados do detalhamento
        salesTransactions.forEach(transaction => {
          const product = products.find(p => p.id === transaction.product_id);
          if (product) {
            const transactionCost = transaction.quantity * product.cost;
            const transactionProfit = transaction.total - transactionCost;
            const transactionMargin = transaction.total > 0 ? (transactionProfit / transaction.total) * 100 : 0;
            
            csvContent.push([
              `"${format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}"`,
              `"${product.name}"`,
              transaction.quantity,
              transaction.total.toFixed(2),
              transactionCost.toFixed(2),
              transactionProfit.toFixed(2),
              transactionMargin.toFixed(1),
              `"${transaction.payment_status === 'paid' ? 'Pago' : 'Pendente'}"`
            ].join(','));
          }
        });
      } else {
        // Cabeçalhos para relatório de estoque
        csvContent.push(['Produto', 'Categoria', 'Estoque', 'Status', 'Valor Custo (R$)'].join(','));
        
        // Dados do estoque
        currentReportData.forEach(item => {
          const inventoryItem = item as {name: string, category: string, currentStock: number, status: string, stockValue: number};
          csvContent.push([
            `"${inventoryItem.name}"`,
            `"${inventoryItem.category}"`,
            inventoryItem.currentStock,
            `"${inventoryItem.status}"`,
            inventoryItem.stockValue.toFixed(2)
          ].join(','));
        });
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
      
      toast.success('Relatório CSV exportado!');
    } catch (error) {
      handleError(error, 'reportsPageCSV');
      toast.error('Erro ao exportar CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Relatórios
        </h1>
        <div className="flex space-x-2">
          <button 
            onClick={exportToPDF} 
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" /> PDF
          </button>
          <button 
            onClick={exportToCSV} 
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value as 'sales' | 'inventory')} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="sales">Vendas</option>
              <option value="inventory">Estoque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Data Inicial</label>
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Data Final</label>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
        </div>
      </div>

      {/* Vendas Mensais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Vendas Mensais
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Mês</th>
                <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Vendas</th>
              </tr>
            </thead>
            <tbody>
              {monthlySalesData.map((data, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 text-gray-900 dark:text-white">{data.name}</td>
                  <td className="py-2 text-gray-900 dark:text-white">R$ {data.sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dados do Relatório */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          {selectedReport === 'sales' ? <TrendingUp className="w-4 h-4 mr-2" /> : <Package className="w-4 h-4 mr-2" />}
          {selectedReport === 'sales' ? 'Dados de Vendas' : 'Dados do Estoque'}
        </h3>
        <div className="overflow-x-auto">
          {selectedReport === 'sales' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Categoria</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Qtd</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Receita</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Custo</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Lucro</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Margem</th>
                </tr>
              </thead>
              <tbody>
                {(currentReportData as Array<{name: string, category: string, quantity: number, revenue: number, cost: number, profit: number}>).map((item, index) => {
                  const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <td className="py-2 font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{item.name}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{item.category}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="py-2 text-green-600 font-medium">R$ {item.revenue.toFixed(2)}</td>
                      <td className="py-2 text-red-600 font-medium">R$ {item.cost.toFixed(2)}</td>
                      <td className="py-2 text-blue-600 font-medium">R$ {item.profit.toFixed(2)}</td>
                      <td className="py-2 font-medium">{margin.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Estoque</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {(currentReportData as Array<{name: string, currentStock: number, status: string, stockValue: number}>).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-2 font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{item.name}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{item.currentStock}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Baixo' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">R$ {item.stockValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detalhamento de Transações - Apenas para relatório de vendas */}
      {selectedReport === 'sales' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Receipt className="w-4 h-4 mr-2" />
            Detalhamento de Transações
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Data</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Qtd</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Receita</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Custo</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Lucro</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Margem</th>
                  <th className="pb-2 text-left text-gray-500 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Filtrar transações de venda pelo período selecionado
                  const startDate = new Date(dateRange.start);
                  const endDate = new Date(dateRange.end);
                  endDate.setHours(23, 59, 59, 999);
                  
                  const salesTransactions = transactions.filter(t => 
                    t.type === 'sale' && 
                    new Date(t.created_at) >= startDate && 
                    new Date(t.created_at) <= endDate
                  );
                  
                  return salesTransactions.map((transaction, index) => {
                    const product = products.find(p => p.id === transaction.product_id);
                    if (!product) return null;
                    
                    const transactionCost = transaction.quantity * product.cost;
                    const transactionProfit = transaction.total - transactionCost;
                    const transactionMargin = transaction.total > 0 ? (transactionProfit / transaction.total) * 100 : 0;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <td className="py-2 text-gray-900 dark:text-white text-xs">
                          {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </td>
                        <td className="py-2 font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                          {product.name}
                        </td>
                        <td className="py-2 text-gray-900 dark:text-white">{transaction.quantity}</td>
                        <td className="py-2 text-green-600 font-medium">R$ {transaction.total.toFixed(2)}</td>
                        <td className="py-2 text-red-600 font-medium">R$ {transactionCost.toFixed(2)}</td>
                        <td className={`py-2 font-medium ${transactionProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {transactionProfit.toFixed(2)}
                        </td>
                        <td className="py-2 font-medium">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transactionMargin >= 20 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            transactionMargin >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {transactionMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {transaction.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;