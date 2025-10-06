import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseTest: React.FC = () => {
  const { syncWithSupabase, loadFromSupabase } = useAppContext();
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSync = async () => {
    setIsLoading(true);
    setStatus('Sincronizando dados com Supabase...');
    try {
      await syncWithSupabase();
      setStatus('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar com Supabase:', error);
      setStatus(`Erro ao sincronizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    setStatus('Carregando dados do Supabase...');
    try {
      await loadFromSupabase();
      setStatus('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar do Supabase:', error);
      setStatus(`Erro ao carregar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
        <CardDescription>
          Teste a conexão com o banco de dados Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Sincronizando...' : 'Sincronizar Dados'}
          </Button>
          <Button 
            onClick={handleLoad} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? 'Carregando...' : 'Carregar Dados'}
          </Button>
        </div>
        
        {status && (
          <div className="p-3 rounded-md bg-muted text-sm">
            {status}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Configuração atual:</strong></p>
          <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}</p>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : 'Não configurada'}</p>
        </div>
      </CardContent>
    </Card>
  );
};