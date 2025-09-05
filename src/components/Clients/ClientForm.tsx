import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import toast from 'react-hot-toast';

interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

const ClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients, addClient, updateClient } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ClientFormData>();

  const isEditing = Boolean(id);
  const client = isEditing ? clients.find(c => c.id === Number(id)) : null;

  useEffect(() => {
    if (isEditing && client) {
      setValue('name', client.name);
      setValue('email', client.email);
      setValue('phone', client.phone);
      setValue('address', client.address);
    }
  }, [isEditing, client, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && client) {
        await updateClient(client.id!, data);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await addClient(data);
        toast.success('Cliente adicionado com sucesso!');
      }
      navigate('/clients');
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Cliente *
              </label>
              <input
                {...register('name', { required: 'Nome é obrigatório' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Digite o nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail
              </label>
              <input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Endereço de e-mail inválido"
                  }
                })}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="(99) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endereço
              </label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
