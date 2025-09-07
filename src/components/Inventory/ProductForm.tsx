import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  category: string;
  cost: number;
  salePrice: number;
  quantity: number;
  supplier: string;
  minStock: number;
  image?: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, addProduct, updateProduct } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>();

  const isEditing = Boolean(id);
  const product = isEditing ? products.find(p => p.id === Number(id)) : null;

  useEffect(() => {
    if (isEditing && product) {
      setValue('name', product.name);
      setValue('category', product.category);
      setValue('cost', product.cost);
      setValue('salePrice', product.salePrice);
      setValue('quantity', product.quantity);
      setValue('supplier', product.supplier);
      setValue('minStock', product.minStock);
      setValue('image', product.image);
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [isEditing, product, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('A imagem não pode ser maior que 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setValue('image', result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('image', undefined);
    setImagePreview(undefined);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const productData = {
        ...data,
        image: imagePreview
      };

      if (isEditing && product) {
        await updateProduct(product.id!, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addProduct(productData);
        toast.success('Produto adicionado com sucesso!');
      }
      navigate('/inventory');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/inventory')}
          className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Fields */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Produto *
                </label>
                <input
                  {...register('name', { required: 'Nome é obrigatório' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite o nome do produto"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria *
                </label>
                <input
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Eletrônicos, Roupas, etc."
                />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custo (R$) *
                </label>
                <input
                  {...register('cost', { required: 'Custo é obrigatório', valueAsNumber: true, min: { value: 0.01, message: 'Custo deve ser maior que zero' } })}
                  type="number" step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preço de Venda (R$) *
                </label>
                <input
                  {...register('salePrice', { required: 'Preço de venda é obrigatório', valueAsNumber: true, min: { value: 0.01, message: 'Preço deve ser maior que zero' } })}
                  type="number" step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {errors.salePrice && <p className="mt-1 text-sm text-red-600">{errors.salePrice.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade em Estoque *
                </label>
                <input
                  {...register('quantity', { required: 'Quantidade é obrigatória', valueAsNumber: true, min: { value: 0, message: 'Quantidade não pode ser negativa' } })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fornecedor *
                </label>
                <input
                  {...register('supplier', { required: 'Fornecedor é obrigatório' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do fornecedor"
                />
                {errors.supplier && <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estoque Mínimo *
                </label>
                <input
                  {...register('minStock', { required: 'Estoque mínimo é obrigatório', valueAsNumber: true, min: { value: 0, message: 'Estoque mínimo não pode ser negativo' } })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
                {errors.minStock && <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagem do Produto
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                      <div 
                        onClick={removeImage}
                        className="absolute top-0 right-0 p-1 bg-red-600 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </div>
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Carregar um arquivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP até 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/inventory')} className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
