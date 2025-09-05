import React, { useState } from 'react';
import { Save, Upload, Building, Palette } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { company, updateCompany } = useConfig();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: company.name,
    logo: company.logo || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(formData);
    toast.success('Configurações salvas com sucesso!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Configurações
      </h1>

      {/* Company Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center mb-6">
          <Building className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Informações da Empresa
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Digite o nome da sua empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo da Empresa
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo && (
                <img 
                  src={formData.logo} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain border border-gray-300 rounded-lg"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Logo
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Configurações
          </button>
        </form>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Aparência
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tema do Sistema
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha entre tema claro ou escuro
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Claro
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Escuro
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PWA Installation Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Instalação do Aplicativo
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Para instalar no celular:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Abra este site no navegador do seu celular</li>
            <li>No Chrome/Safari, toque no menu (3 pontos) e selecione "Adicionar à tela inicial"</li>
            <li>O app será instalado e poderá ser usado offline</li>
          </ul>
          <p className="mt-4">
            <strong>Recursos offline:</strong> O sistema salva todos os dados localmente e sincroniza quando conectado à internet.
          </p>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Versão:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Última Atualização:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Modo:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              PWA (Progressive Web App)
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className="ml-2 font-medium text-green-600">Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
