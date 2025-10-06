import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  supabaseLoginService, 
  supabaseTaskService, 
  supabaseRoutineService, 
  supabaseNoteService, 
  supabaseFavoriteService 
} from '@/services/supabase/supabaseService';

export const FullSupabaseTest: React.FC = () => {
  const { 
    logins, 
    tasks, 
    routines, 
    notes, 
    favorites,
    addLogin,
    addTask,
    addRoutine,
    addNote,
    addFavorite,
    syncWithSupabase,
    loadFromSupabase
  } = useAppContext();
  
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Função para criar dados de teste
  const createTestData = () => {
    // Criar um login de teste
    addLogin({
      id: 'test-login-' + Date.now(),
      title: 'Test Login',
      email: 'test@example.com',
      password: 'test123',
      website: 'https://example.com',
      category: 'test',
      notes: 'Test login notes',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Criar uma tarefa de teste
    addTask({
      id: 'test-task-' + Date.now(),
      title: 'Test Task',
      description: 'Test task description',
      category: 'test',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString(),
      dueTime: '10:00',
      isRecurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Criar uma rotina de teste
    addRoutine({
      id: 'test-routine-' + Date.now(),
      title: 'Test Routine',
      description: 'Test routine description',
      days: ['monday', 'wednesday', 'friday'],
      time: '08:00',
      checklist: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastCompleted: new Date().toISOString()
    });

    // Criar uma nota de teste
    addNote({
      id: 'test-note-' + Date.now(),
      title: 'Test Note',
      content: 'Test note content',
      tags: ['test', 'note'],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Criar um favorito de teste
    addFavorite({
      id: 'test-favorite-' + Date.now(),
      title: 'Test Favorite',
      url: 'https://example.com',
      description: 'Test favorite description',
      icon: '',
      category: 'test',
      createdAt: new Date().toISOString()
    });

    setStatus('Dados de teste criados localmente!');
  };

  // Função para testar a sincronização
  const testSync = async () => {
    setIsLoading(true);
    setStatus('Sincronizando dados com Supabase...');
    
    try {
      await syncWithSupabase();
      setStatus('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setStatus(`Erro ao sincronizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para testar o carregamento
  const testLoad = async () => {
    setIsLoading(true);
    setStatus('Carregando dados do Supabase...');
    
    try {
      await loadFromSupabase();
      setStatus('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setStatus(`Erro ao carregar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para testar operações CRUD no Supabase
  const testCRUD = async () => {
    setIsLoading(true);
    setStatus('Testando operações CRUD no Supabase...');
    
    try {
      // Testar criação
      const testLogin = {
        id: 'crud-test-' + Date.now(),
        title: 'CRUD Test Login',
        username: 'crudtest@example.com',
        password: 'crud123',
        url: 'https://crudtest.com',
        category: 'test',
        notes: 'CRUD test notes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const createdLogin = await supabaseLoginService.create({
        id: testLogin.id,
        title: testLogin.title,
        email: testLogin.username,
        password: testLogin.password,
        website: testLogin.url,
        category: testLogin.category,
        notes: testLogin.notes,
        isFavorite: false,
        createdAt: testLogin.created_at,
        updatedAt: testLogin.updated_at
      });
      
      // Testar leitura
      const fetchedLogin = await supabaseLoginService.getById(createdLogin.id);
      
      // Testar atualização
      if (fetchedLogin) {
        const updatedLogin = await supabaseLoginService.update(fetchedLogin.id, {
          title: 'Updated CRUD Test Login'
        });
        
        // Testar deleção
        await supabaseLoginService.delete(updatedLogin.id);
      }
      
      setStatus('Operações CRUD testadas com sucesso!');
    } catch (error) {
      console.error('Erro ao testar CRUD:', error);
      setStatus(`Erro ao testar CRUD: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste Completo do Supabase</CardTitle>
        <CardDescription>
          Teste todas as funcionalidades de integração com o Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={createTestData} 
            disabled={isLoading}
            variant="outline"
          >
            Criar Dados de Teste
          </Button>
          
          <Button 
            onClick={testSync} 
            disabled={isLoading}
          >
            {isLoading ? 'Sincronizando...' : 'Sincronizar com Supabase'}
          </Button>
          
          <Button 
            onClick={testLoad} 
            disabled={isLoading}
            variant="secondary"
          >
            {isLoading ? 'Carregando...' : 'Carregar do Supabase'}
          </Button>
          
          <Button 
            onClick={testCRUD} 
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? 'Testando...' : 'Testar CRUD'}
          </Button>
        </div>
        
        {status && (
          <div className="p-3 rounded-md bg-muted text-sm">
            {status}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Estatísticas Locais:</strong></p>
          <p>Logins: {logins.length}</p>
          <p>Tarefas: {tasks.length}</p>
          <p>Rotinas: {routines.length}</p>
          <p>Notas: {notes.length}</p>
          <p>Favoritos: {favorites.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};