import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Security() {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleExportData = () => {
    const data = {
      logins: localStorage.getItem('logins'),
      tasks: localStorage.getItem('tasks'),
      routines: localStorage.getItem('routines'),
      notes: localStorage.getItem('notes'),
      favorites: localStorage.getItem('favorites'),
      activities: localStorage.getItem('activities'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup criado",
      description: "Seus dados foram exportados com sucesso"
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.logins) localStorage.setItem('logins', data.logins);
        if (data.tasks) localStorage.setItem('tasks', data.tasks);
        if (data.routines) localStorage.setItem('routines', data.routines);
        if (data.notes) localStorage.setItem('notes', data.notes);
        if (data.favorites) localStorage.setItem('favorites', data.favorites);
        if (data.activities) localStorage.setItem('activities', data.activities);

        toast({
          title: "Dados importados",
          description: "Seus dados foram restaurados com sucesso"
        });
        
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo de backup inválido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    toast({
      title: "Dados apagados",
      description: "Todos os dados foram removidos com sucesso"
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const storageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Segurança e Backup</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Criptografia</CardTitle>
            </div>
            <CardDescription>
              Seus dados são criptografados localmente usando XOR encryption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="master-password">Senha Mestra (Opcional)</Label>
              <div className="relative mt-2">
                <Input
                  id="master-password"
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Digite uma senha mestra"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Lock className="h-4 w-4 text-green-500" />
              <span className="text-sm">Dados protegidos localmente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Armazenamento</CardTitle>
            <CardDescription>
              Informações sobre o uso do armazenamento local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Espaço utilizado:</span>
                <span className="font-medium">{storageSize()} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de itens:</span>
                <span className="font-medium">{Object.keys(localStorage).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup e Restauração</CardTitle>
            <CardDescription>
              Faça backup dos seus dados ou restaure de um arquivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExportData} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
            <div>
              <Label htmlFor="import-file" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 w-full py-2 px-4 border rounded-md hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Importar Dados</span>
                </div>
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam todos os seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Apagar Todos os Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os seus logins, tarefas, rotinas, notas e favoritos serão permanentemente apagados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData} className="bg-destructive">
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
