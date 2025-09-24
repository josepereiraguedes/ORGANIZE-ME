import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalDatabase, Product } from '../../contexts/LocalDatabaseContext';
import toast from 'react-hot-toast';
import { Upload, X, ChevronDown } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ product }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { products, categories, subcategories, addProduct, updateProduct } = useLocalDatabase();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    cost: 0,
    sale_price: 0,
    quantity: 0,
    supplier: '',
    min_stock: 0,
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);

  // Obter categorias únicas do contexto
  const sortedCategories = useMemo(() => {
    return [...categories].sort();
  }, [categories]);

  // Obter subcategorias da categoria selecionada do contexto
  const categorySubcategories = useMemo(() => {
    if (!formData.category) return [];
    return (subcategories[formData.category] || []).sort();
  }, [subcategories, formData.category]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || '',
        cost: product.cost,
        sale_price: product.sale_price,
        quantity: product.quantity,
        supplier: product.supplier,
        min_stock: product.min_stock,
        image: product.image || ''
      });
      setImagePreview(product.image || null);
    } else if (id) {
      const existingProduct = products.find(p => p.id === parseInt(id));
      if (existingProduct) {
        setFormData({
          name: existingProduct.name,
          category: existingProduct.category,
          subcategory: existingProduct.subcategory || '',
          cost: existingProduct.cost,
          sale_price: existingProduct.sale_price,
          quantity: existingProduct.quantity,
          supplier: existingProduct.supplier,
          min_stock: existingProduct.min_stock,
          image: existingProduct.image || ''
        });
        setImagePreview(existingProduct.image || null);
      }
    }
  }, [product, id, products]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.match('image.*')) {
        toast.error('Por favor, selecione um arquivo de imagem válido');
        return;
      }
      
      // Verificar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, image: result });
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview(null);
    // Limpar o input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para salvar um produto');
      return;
    }

    try {
      // Validar dados obrigatórios
      if (!formData.name.trim()) {
        toast.error('O nome do produto é obrigatório');
        return;
      }
      
      if (formData.cost < 0) {
        toast.error('O custo não pode ser negativo');
        return;
      }
      
      if (formData.sale_price < 0) {
        toast.error('O preço de venda não pode ser negativo');
        return;
      }
      
      if (formData.quantity < 0) {
        toast.error('A quantidade não pode ser negativa');
        return;
      }
      
      if (formData.min_stock < 0) {
        toast.error('O estoque mínimo não pode ser negativo');
        return;
      }

      if (product || id) {
        // Atualizar produto existente
        const productId = product?.id || parseInt(id || '0');
        await updateProduct(productId, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await addProduct(formData);
        toast.success('Produto adicionado com sucesso!');
      }
      navigate('/inventory');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {product || id ? 'Editar Produto' : 'Novo Produto'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* Seção de Imagem do Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagem do Produto
            </label>
            <div className="flex items-start space-x-4">
              {/* Preview da Imagem */}
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Botão de Upload */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher Imagem
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG ou GIF (máx. 2MB)
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nome do produto"
            />
          </div>
          
          {/* Dropdown de Categoria */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex justify-between items-center"
              >
                <span>{formData.category || 'Selecione uma categoria'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => window.location.hash = '#/categories'}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                title="Gerenciar categorias"
              >
                +
              </button>
            </div>
            
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, category: '', subcategory: '' });
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                >
                  Nenhuma categoria
                </button>
                {sortedCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category, subcategory: '' });
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Dropdown de Subcategoria */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subcategoria
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                disabled={!formData.category}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex justify-between items-center disabled:opacity-50"
              >
                <span>{formData.subcategory || 'Selecione uma subcategoria'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => window.location.hash = '#/categories'}
                disabled={!formData.category}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                title="Gerenciar subcategorias"
              >
                +
              </button>
            </div>
            
            {isSubcategoryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, subcategory: '' });
                    setIsSubcategoryDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                >
                  Nenhuma subcategoria
                </button>
                {categorySubcategories.map(subcategory => (
                  <button
                    key={subcategory}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, subcategory });
                      setIsSubcategoryDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantidade em Estoque *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nome do fornecedor"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;