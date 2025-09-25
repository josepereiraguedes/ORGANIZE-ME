import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Eye, EyeOff, Edit, Copy, Trash2, Star, Globe, Building, ShoppingCart, CreditCard, Users } from 'lucide-react';
import { LoginItem, saveToStorage, loadFromStorage, generateId, addActivity } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'work', label: 'Trabalho', icon: Building },
  { value: 'personal', label: 'Pessoal', icon: Users },
  { value: 'shopping', label: 'Compras', icon: ShoppingCart },
  { value: 'banking', label: 'Bancos', icon: CreditCard },
  { value: 'social', label: 'Redes Sociais', icon: Users },
  { value: 'other', label: 'Outros', icon: Globe }
];

export default function Logins() {
  const [logins, setLogins] = useState<LoginItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogin, setEditingLogin] = useState<LoginItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    email: '',
    password: '',
    website: '',
    category: 'personal',
    notes: '',
    isFavorite: false
  });

  useEffect(() => {
    loadLogins();
  }, []);

  const loadLogins = () => {
    const savedLogins = loadFromStorage<LoginItem[]>('logins', [], true);
    setLogins(savedLogins);
  };

  const saveLogins = (newLogins: LoginItem[]) => {
    saveToStorage('logins', newLogins, true);
    setLogins(newLogins);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingLogin) {
      const updatedLogins = logins.map(login => 
        login.id === editingLogin.id 
          ? { ...login, ...formData, updatedAt: now }
          : login
      );
      saveLogins(updatedLogins);
      addActivity('login', 'Editado', formData.title);
      toast({
        title: "Sucesso",
        description: "Login atualizado com sucesso"
      });
    } else {
      const newLogin: LoginItem = {
        id: generateId(),
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      saveLogins([...logins, newLogin]);
      addActivity('login', 'Criado', formData.title);
      toast({
        title: "Sucesso",
        description: "Login salvo com sucesso"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      email: '',
      password: '',
      website: '',
      category: 'personal',
      notes: '',
      isFavorite: false
    });
    setEditingLogin(null);
  };

  const handleEdit = (login: LoginItem) => {
    setFormData({
      title: login.title,
      email: login.email,
      password: login.password,
      website: login.website,
      category: login.category,
      notes: login.notes,
      isFavorite: login.isFavorite
    });
    setEditingLogin(login);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const updatedLogins = logins.filter(login => login.id !== id);
    saveLogins(updatedLogins);
    addActivity('login', 'Excluído', title);
    toast({
      title: "Sucesso",
      description: "Login excluído com sucesso"
    });
  };

  const toggleFavorite = (id: string) => {
    const updatedLogins = logins.map(login => 
      login.id === id 
        ? { ...login, isFavorite: !login.isFavorite, updatedAt: new Date().toISOString() }
        : login
    );
    saveLogins(updatedLogins);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${type} copiado para a área de transferência`
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredLogins = logins
    .filter(login => {
      const matchesSearch = login.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           login.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           login.website.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || login.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciador de Logins</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Login
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLogin ? 'Editar Login' : 'Novo Login'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Gmail, Facebook, etc."
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail/Usuário *</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="website">Site/App</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isFavorite}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
                />
                <Label>Marcar como favorito</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingLogin ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar logins..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLogins.map(login => {
          const categoryInfo = categories.find(cat => cat.value === login.category);
          const CategoryIcon = categoryInfo?.icon || Globe;
          
          return (
            <Card key={login.id} className="relative group">
              {login.isFavorite && (
                <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{login.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {categoryInfo?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(login.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className={`h-4 w-4 ${login.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">E-mail:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(login.email, 'E-mail')}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all">{login.email}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Senha:</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(login.id)}
                        className="h-6 px-2"
                      >
                        {showPasswords[login.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(login.password, 'Senha')}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {showPasswords[login.id] ? login.password : '••••••••'}
                  </p>
                </div>

                {login.website && (
                  <div>
                    <span className="text-sm text-muted-foreground">Site:</span>
                    <p className="text-sm text-primary underline cursor-pointer" 
                       onClick={() => window.open(login.website, '_blank')}>
                      {login.website}
                    </p>
                  </div>
                )}

                {login.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Observações:</span>
                    <p className="text-sm">{login.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Atualizado: {new Date(login.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(login)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o login "{login.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(login.id, login.title)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLogins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Nenhum login encontrado com os filtros aplicados.'
              : 'Nenhum login cadastrado. Clique em "Novo Login" para começar.'
            }
          </p>
        </div>
      )}
    </div>
  );
}