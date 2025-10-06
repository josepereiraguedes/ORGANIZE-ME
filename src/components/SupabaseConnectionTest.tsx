import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';

export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando...');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Testar a conexão básica com o Supabase
        const { data, error } = await supabase
          .from('logins')
          .select('count()', { count: 'exact', head: true });
        
        if (error) {
          setConnectionStatus(`Erro: ${error.message}`);
          setIsConnected(false);
        } else {
          setConnectionStatus('Conectado com sucesso!');
          setIsConnected(true);
        }
      } catch (error) {
        setConnectionStatus(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-muted">
      <h3 className="text-lg font-semibold mb-2">Teste de Conexão com Supabase</h3>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected === true ? 'bg-green-500' : isConnected === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
        <span>{connectionStatus}</span>
      </div>
      {isConnected === false && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Verifique se:</p>
          <ul className="list-disc list-inside">
            <li>As variáveis de ambiente estão configuradas corretamente</li>
            <li>As tabelas foram criadas no Supabase</li>
            <li>A chave da API tem as permissões adequadas</li>
          </ul>
        </div>
      )}
    </div>
  );
};