import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import toast from 'react-hot-toast';

interface TransactionFormData {
  type: 'sale' | 'purchase' | 'adjustment';
  productId: number;
  clientId?: number;
  quantity: number;
  unitPrice: number;
  paymentStatus: 'paid' | 'pending';
  description?: string;
}

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { products, clients, addTransaction } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      paymentStatus: 'paid'
    }
  });

  const watchedType = watch('type');
  const watchedProductId = watch('productId');
  const watchedQuantity = watch('quantity') || 0;
  const watchedUnitPrice = watch('unitPrice') || 0;

  const selectedProduct = products.find(p => p.id === Number(watchedProductId));
  const total = watchedQuantity * watchedUnitPrice;

  React.useEffect(() => {
    if (selectedProduct && watchedType) {
      if (watchedType === 'sale') {
        setValue('unitPrice', Number(selectedProduct.salePrice) || 0);
      } else if (watchedType === 'purchase') {
        setValue('unitPrice', Number(selectedProduct.cost) || 0);
      }
    }
  }, [selectedProduct, watchedType, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const transactionData = {
        ...data,
        clientId: isNaN(data.clientId!) ? undefined : Number(data.clientId),
        total: data.quantity * data.unitPrice,
        paymentStatus: data.type === 'sale' ? data.paymentStatus : 'paid',
      };
      await addTransaction(transactionData);
      toast.success('Transação registrada com sucesso!');
      navigate('/sales');
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/sales')}
          className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nova Transação
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Transação *
              </label>
              <select
                {...register('type', { required: 'Tipo de transação é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione o tipo</option>
                <option value="sale">Venda</option>
                <option value="purchase">Compra</option>
                <option value="adjustment">Ajuste de Estoque</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produto *
              </label>
              <select
                {...register('productId', { required: 'Produto é obrigatório', valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione o produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.quantity}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>}
            </div>

            {watchedType === 'sale' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente (Opcional)
                  </label>
                  <select
                    {...register('clientId', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione o cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status do Pagamento *
                  </label>
                  <select
                    {...register('paymentStatus', { required: 'Status é obrigatório' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">Pago</option>
                    <option value="pending">A Pagar</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantidade *
              </label>
              <input
                {...register('quantity', { required: 'Quantidade é obrigatória', valueAsNumber: true, min: { value: 1, message: 'Quantidade deve ser maior que zero' } })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
              {selectedProduct && watchedType === 'sale' && watchedQuantity > Number(selectedProduct.quantity) && (
                <p className="mt-1 text-sm text-yellow-600">
                  Aviso: Quantidade maior que o estoque disponível ({selectedProduct.quantity})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Unitário (R$) *
              </label>
              <input
                {...register('unitPrice', { required: 'Valor unitário é obrigatório', valueAsNumber: true, min: { value: 0.01, message: 'Valor deve ser maior que zero' } })}
                type="number" step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Informações adicionais sobre a transação..."
              />
            </div>
          </div>

          {selectedProduct && watchedQuantity > 0 && watchedUnitPrice > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Resumo da Transação
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                      <Save size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Produto:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedProduct.name}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Estoque Atual:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedProduct.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Quantidade:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {watchedQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Valor Unitário:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    R$ {watchedUnitPrice.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                {watchedType !== 'adjustment' && (
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Novo Estoque:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {watchedType === 'sale' 
                        ? Number(selectedProduct.quantity) - watchedQuantity
                        : Number(selectedProduct.quantity) + watchedQuantity
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/sales')} className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Registrando...' : 'Registrar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
