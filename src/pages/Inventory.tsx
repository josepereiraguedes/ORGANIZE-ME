import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { handleError } from '../utils/errorHandler';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Inventory: React.FC = () => {
  const { products, deleteProduct } = useLocalDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDeleteProduct = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Produto excluído com sucesso!');
      } catch (error) {
        handleError(error, 'inventoryPage');
        toast.error('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestão de Estoque
        </h1>
        <Link
          to="/inventory/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}

          >
            <div className="relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
              ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {Number(product.quantity) <= Number(product.min_stock) && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  !
                </div>
              )}

            </div>
            
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex-grow">
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estoque:</span>
                    <span className={`font-medium ${Number(product.quantity) <= Number(product.min_stock) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {product.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Preço:</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      R$ {(Number(product.sale_price) || 0).toFixed(2)}
                    </span>

                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className={`text-sm font-medium ${Number(product.quantity) <= Number(product.min_stock) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {product.quantity} {product.quantity <= 1 ? 'unidade' : 'unidades'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    R$ {((Number(product.quantity) || 0) * (Number(product.sale_price) || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/inventory/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteProduct(product.id!, product.name)} 
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {products.length === 0 
              ? 'Adicione seu primeiro produto para começar'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;