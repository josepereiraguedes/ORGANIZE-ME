import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { SupabaseTest } from '@/components/SupabaseTest';
import { SupabaseConnectionTest } from '@/components/SupabaseConnectionTest';
import { FullSupabaseTest } from '@/components/FullSupabaseTest';

export default function Settings() {
  const { 
    logins, 
    tasks, 
    routines, 
    notes, 
    favorites,
    syncWithSupabase
  } = useAppContext();
  
  const [autoSync, setAutoSync] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState(24);
  const [secretKey, setSecretKey] = useState('');
  
  const handleSave = () => {
    // Salvar configurações
    console.log('Configurações salvas');
  };

  const handleSync = async () => {
    try {
      await syncWithSupabase();
      alert('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar dados');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu aplicativo
        </p>
      </div>

      {/* Teste de Conexão Supabase */}
      <Card>
        <CardHeader>
          <CardTitle>Conexão com Supabase</CardTitle>
          <CardDescription>
            Verificação da conexão com o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseConnectionTest />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Configure as preferências do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-sync">Sincronização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Sincronizar dados automaticamente com a nuvem
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backup">Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Criar backups automáticos dos seus dados
                </p>
              </div>
              <Switch
                id="backup"
                checked={backupEnabled}
                onCheckedChange={setBackupEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-interval">Intervalo de Backup (horas)</Label>
              <Input
                id="backup-interval"
                type="number"
                min="1"
                max="168"
                value={backupInterval}
                onChange={(e) => setBackupInterval(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secret-key">Chave Secreta</Label>
              <Input
                id="secret-key"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Digite sua chave secreta"
              />
            </div>
            
            <Button onClick={handleSave}>Salvar Configurações</Button>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>
              Visão geral dos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold">{logins.length}</div>
                <div className="text-sm text-muted-foreground">Logins</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Tarefas</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold">{routines.length}</div>
                <div className="text-sm text-muted-foreground">Rotinas</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold">{notes.length}</div>
                <div className="text-sm text-muted-foreground">Notas</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">Favoritos</div>
              <div className="text-3xl font-bold text-primary">{favorites.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Conexão Supabase */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase</CardTitle>
            <CardDescription>
              Configuração e teste de conexão com o banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupabaseTest />
          </CardContent>
        </Card>

        {/* Sincronização Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Sincronização</CardTitle>
            <CardDescription>
              Sincronize seus dados manualmente com a nuvem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSync} 
              className="w-full"
            >
              Sincronizar Agora
            </Button>
            <p className="text-sm text-muted-foreground">
              Força a sincronização imediata de todos os dados locais com o Supabase.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teste Completo do Supabase */}
      <FullSupabaseTest />
    </div>
  );
}