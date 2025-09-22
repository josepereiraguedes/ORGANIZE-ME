import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalDatabase } from '../contexts/LocalDatabaseContext';
import { dataExportImportService, ExportedData, BackupData } from '../services/dataExportImport';
import toast from 'react-hot-toast';

const DataExportImport: React.FC = () => {
  const { user } = useAuth();
  const { products, clients, transactions } = useLocalDatabase();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar backups ao montar o componente
  React.useEffect(() => {
    const loadedBackups = dataExportImportService.getBackups();
    setBackups(loadedBackups);
  }, []);

  /**
   * Função para exportar dados
   */
  const handleExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const userName = user?.name || user?.email || 'Usuário';
      const blob = await dataExportImportService.exportData(user.id, userName);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gestao-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Função para importar dados
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    setIsImporting(true);
    try {
      const file = event.target.files[0];
      
      // Verificar se é um arquivo JSON
      if (file.type !== 'application/json') {
        toast.error('Por favor, selecione um arquivo JSON válido');
        return;
      }
      
      await dataExportImportService.importData(file, user.id);
      
      toast.success('Dados importados com sucesso!');
      
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Recarregar dados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Função para restaurar um backup
   */
  const handleRestoreBackup = async () => {
    if (!user || !selectedBackup) return;
    
    try {
      const backup = backups.find(b => b.metadata.backupDate === selectedBackup);
      if (!backup) {
        toast.error('Backup não encontrado');
        return;
      }
      
      await dataExportImportService.restoreBackup(backup, user.id);
      
      toast.success('Backup restaurado com sucesso!');
      
      // Recarregar dados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
    }
  };

  /**
   * Função para remover um backup
   */
  const handleRemoveBackup = () => {
    if (!selectedBackup) return;
    
    try {
      dataExportImportService.removeBackup(selectedBackup);
      
      // Atualizar lista de backups
      const updatedBackups = backups.filter(b => b.metadata.backupDate !== selectedBackup);
      setBackups(updatedBackups);
      setSelectedBackup('');
      
      toast.success('Backup removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover backup:', error);
      toast.error('Erro ao remover backup');
    }
  };

  /**
   * Função para formatar data
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Exportar/Importar Dados
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Exportação */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Exportar Dados
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Exporte todos os seus dados para compartilhar com outros dispositivos.
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Produtos:</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Clientes:</span>
              <span className="font-medium">{clients.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Transações:</span>
              <span className="font-medium">{transactions.length}</span>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
          >
            {isExporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </div>
            ) : (
              'Exportar Dados'
            )}
          </button>
        </div>
        
        {/* Seção de Importação */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Importar Dados
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Importe dados de outro dispositivo para atualizar seu sistema.
          </p>
          
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              disabled={isImporting}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition duration-150 ease-in-out ${
                isImporting 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400'
              }`}
            >
              {isImporting ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Importando...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Clique para selecionar arquivo JSON
                  </span>
                </>
              )}
            </label>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>• O arquivo deve ser no formato JSON exportado pelo sistema</p>
            <p>• Os dados atuais serão substituídos pelos dados importados</p>
          </div>
        </div>
      </div>
      
      {/* Seção de Backups */}
      {backups.length > 0 && (
        <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Backups Automáticos
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Backups criados automaticamente antes de importações.
          </p>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedBackup}
                onChange={(e) => setSelectedBackup(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um backup</option>
                {backups.map((backup) => (
                  <option 
                    key={backup.metadata.backupDate} 
                    value={backup.metadata.backupDate}
                  >
                    {formatDate(backup.metadata.backupDate)} - {backup.metadata.user}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreBackup}
                  disabled={!selectedBackup}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Restaurar
                </button>
                
                <button
                  onClick={handleRemoveBackup}
                  disabled={!selectedBackup}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remover
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>• Apenas os 5 backups mais recentes são mantidos</p>
              <p>• Restaurar um backup substituirá os dados atuais</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Informações de uso */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Como compartilhar dados entre dispositivos
        </h4>
        <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
          <li>Exporte os dados no dispositivo de origem</li>
          <li>Transfira o arquivo JSON para o dispositivo de destino (email, pendrive, etc.)</li>
          <li>Importe o arquivo no dispositivo de destino</li>
          <li>Os dados serão atualizados automaticamente</li>
        </ol>
      </div>
    </div>
  );
};

export default DataExportImport;