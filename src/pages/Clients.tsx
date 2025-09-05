import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Clients: React.FC = () => {
  const { clients, deleteClient } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClient = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"?`)) {
      try {
        await deleteClient(id);
        toast.success('Cliente excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestão de Clientes
        </h1>
        <Link
          to="/clients/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {client.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm flex-grow">
              {client.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-1" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Link
                  to={`/clients/edit/${client.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeleteClient(client.id!, client.name)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {clients.length === 0 
              ? 'Adicione seu primeiro cliente para começar'
              : 'Tente ajustar o filtro de busca'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Clients;
