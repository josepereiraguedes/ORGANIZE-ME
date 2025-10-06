import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalDatabase } from '../../contexts/LocalDatabaseContext';
import { Product, Client } from '../../contexts/LocalDatabaseContext';
import toast from 'react-hot-toast';

interface TransactionFormProps {
  transaction?: any;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { products, clients, addTransaction } = useLocalDatabase();
  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'purchase' | 'adjustment',
    product_id: 0,
    client_id: 0,
    quantity: 1,
    unit_price: 0,
    total: 0,
    payment_status: 'paid' as 'paid' | 'pending',
    description: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        product_id: transaction.product_id,
        client_id: transaction.client_id || 0,
        quantity: transaction.quantity,
        unit_price: transaction.unit_price,
        total: transaction.total,
        payment_status: transaction.payment_status,
        description: transaction.description || ''
      });
    }
  }, [transaction]);

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const unitPrice = formData.type === 'sale' ? product.sale_price : product.cost;
      const total = calculateTotal(formData.quantity, unitPrice);
      
      setFormData({
        ...formData,
        product_id: productId,
        unit_price: unitPrice,
        total
      });
    }
  };

  const handleQuantityChange = (quantity: number) => {
    const total = calculateTotal(quantity, formData.unit_price);
    setFormData({
      ...formData,
      quantity,
      total
    });
  };

  const handleUnitPriceChange = (unitPrice: number) => {
    const total = calculateTotal(formData.quantity, unitPrice);
    setFormData({
      ...formData,
      unit_price: unitPrice,
      total
    });
  };

  const handleTypeChange = (type: 'sale' | 'purchase' | 'adjustment') => {
    let unitPrice = formData.unit_price;
    
    if (type !== 'adjustment' && formData.product_id) {
      const product = products.find(p => p.id === formData.product_id);
      if (product) {
        unitPrice = type === 'sale' ? product.sale_price : product.cost;
      }
    }
    
    const total = calculateTotal(formData.quantity, unitPrice);
    
    setFormData({
      ...formData,
      type,
      unit_price: unitPrice,
      total
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para registrar uma transação');
      return;
    }

    try {
      // Validar dados obrigatórios
      if (formData.type !== 'adjustment' && !formData.product_id) {
        toast.error('Selecione um produto');
        return;
      }
      
      if (formData.quantity <= 0) {
        toast.error('A quantidade deve ser maior que zero');
        return;
      }
      
      if (formData.unit_price < 0) {
        toast.error('O preço unitário não pode ser negativo');
        return;
      }

      await addTransaction({
        ...formData,
        client_id: formData.client_id || undefined
      });
      
      toast.success('Transação registrada com sucesso!');
      navigate('/sales');
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação');
    }
  };

  // Filtrar produtos com estoque disponível para vendas
  const availableProducts = formData.type === 'sale' 
    ? products.filter(p => p.quantity > 0)
    : products;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Nova Transação
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Transação *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="sale">Venda</option>
              <option value="purchase">Compra</option>
              <option value="adjustment">Ajuste de Estoque</option>
            </select>
          </div>
          
          {formData.type !== 'adjustment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produto *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {availableProducts.map((product: Product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Estoque: {product.quantity} - 
                      {formData.type === 'sale' ? ` Venda: R$${product.sale_price.toFixed(2)}` : ` Custo: R$${product.cost.toFixed(2)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Unitário (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => handleUnitPriceChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </>
          )}
          
          {formData.type === 'sale' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione um cliente (opcional)</option>
                {clients.map((client: Client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            />
          </div>
          
          {formData.type === 'sale' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status do Pagamento
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descrição adicional da transação"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Registrar Transação
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;