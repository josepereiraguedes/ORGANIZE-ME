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
import { Search, Plus, Edit, Trash2, ExternalLink, Globe, Star, Bookmark, Link as LinkIcon, Video, Code, BookOpen, FileText, Music } from 'lucide-react';
import { FavoriteItem, saveToStorage, loadFromStorage, generateId, addActivity } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'websites', label: 'Sites', icon: Globe },
  { value: 'tools', label: 'Ferramentas', icon: Code },
  { value: 'social', label: 'Redes Sociais', icon: Star },
  { value: 'learning', label: 'Estudos', icon: BookOpen },
  { value: 'entertainment', label: 'Entretenimento', icon: Video },
  { value: 'documents', label: 'Documentos', icon: FileText },
  { value: 'music', label: 'Música', icon: Music },
  { value: 'other', label: 'Outros', icon: Bookmark }
];

const iconOptions = [
  { value: 'globe', label: 'Site', icon: Globe },
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'star', label: 'Favorito', icon: Star },
  { value: 'bookmark', label: 'Marcador', icon: Bookmark },
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'code', label: 'Código', icon: Code },
  { value: 'book', label: 'Livro', icon: BookOpen },
  { value: 'file', label: 'Arquivo', icon: FileText },
  { value: 'music', label: 'Música', icon: Music }
];

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon: 'globe',
    category: 'websites'
  });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const savedFavorites = loadFromStorage<FavoriteItem[]>('favorites', []);
    setFavorites(savedFavorites);
  };

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    saveToStorage('favorites', newFavorites);
    setFavorites(newFavorites);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    try {
      const url = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
      new URL(url);
    } catch {
      toast({
        title: "Erro",
        description: "URL inválida. Verifique o endereço",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingFavorite) {
      const updatedFavorites = favorites.map(favorite => 
        favorite.id === editingFavorite.id 
          ? { ...favorite, ...formData }
          : favorite
      );
      saveFavorites(updatedFavorites);
      addActivity('favorite', 'Editado', formData.title);
      toast({
        title: "Sucesso",
        description: "Favorito atualizado com sucesso"
      });
    } else {
      const newFavorite: FavoriteItem = {
        id: generateId(),
        ...formData,
        createdAt: now
      };
      saveFavorites([...favorites, newFavorite]);
      addActivity('favorite', 'Criado', formData.title);
      toast({
        title: "Sucesso",
        description: "Favorito criado com sucesso"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      icon: 'globe',
      category: 'websites'
    });
    setEditingFavorite(null);
  };

  const handleEdit = (favorite: FavoriteItem) => {
    setFormData({
      title: favorite.title,
      url: favorite.url,
      description: favorite.description,
      icon: favorite.icon,
      category: favorite.category
    });
    setEditingFavorite(favorite);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const updatedFavorites = favorites.filter(favorite => favorite.id !== id);
    saveFavorites(updatedFavorites);
    addActivity('favorite', 'Excluído', title);
    toast({
      title: "Sucesso",
      description: "Favorito excluído com sucesso"
    });
  };

  const openUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const duplicateFavorite = (favorite: FavoriteItem) => {
    const newFavorite: FavoriteItem = {
      ...favorite,
      id: generateId(),
      title: `${favorite.title} (Cópia)`,
      createdAt: new Date().toISOString()
    };
    saveFavorites([...favorites, newFavorite]);
    addActivity('favorite', 'Duplicado', newFavorite.title);
    toast({
      title: "Sucesso",
      description: "Favorito duplicado com sucesso"
    });
  };

  const getFavoritesByCategory = () => {
    const filtered = favorites.filter(favorite => {
      const matchesSearch = favorite.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || favorite.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Group by category
    const grouped = categories.reduce((acc, category) => {
      acc[category.value] = filtered.filter(fav => fav.category === category.value);
      return acc;
    }, {} as Record<string, FavoriteItem[]>);

    return grouped;
  };

  const groupedFavorites = getFavoritesByCategory();
  const totalFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || favorite.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).length;

  const FavoriteCard = ({ favorite }: { favorite: FavoriteItem }) => {
    const iconInfo = iconOptions.find(icon => icon.value === favorite.icon);
    const IconComponent = iconInfo?.icon || Globe;
    
    return (
      <Card className="group hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3" onClick={() => openUrl(favorite.url)}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-1">{favorite.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {favorite.url}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {favorite.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {favorite.description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {new Date(favorite.createdAt).toLocaleDateString('pt-BR')}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateFavorite(favorite);
                }}
                className="h-6 px-2"
                title="Duplicar favorito"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(favorite);
                }}
                className="h-6 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o favorito "{favorite.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(favorite.id, favorite.title)}>
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Favoritos & Atalhos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Favorito
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFavorite ? 'Editar Favorito' : 'Novo Favorito'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do site ou ferramenta"
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://exemplo.com ou exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do site ou ferramenta"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="icon">Ícone</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFavorite ? 'Atualizar' : 'Salvar Favorito'}
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
              placeholder="Buscar favoritos..."
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

      {/* Quick Access Grid */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {favorites.slice(0, 12).map(favorite => {
            const iconInfo = iconOptions.find(icon => icon.value === favorite.icon);
            const IconComponent = iconInfo?.icon || Globe;
            
            return (
              <Button
                key={favorite.id}
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-primary/5"
                onClick={() => openUrl(favorite.url)}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs text-center line-clamp-2">{favorite.title}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Grouped by Category */}
      <div className="space-y-8">
        {categories.map(category => {
          const categoryFavorites = groupedFavorites[category.value];
          if (!categoryFavorites || categoryFavorites.length === 0) return null;
          
          const CategoryIcon = category.icon;
          
          return (
            <div key={category.value} className="space-y-4">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{category.label}</h2>
                <Badge variant="secondary">{categoryFavorites.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryFavorites.map(favorite => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalFavorites === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all'
              ? 'Nenhum favorito encontrado com os filtros aplicados.'
              : 'Nenhum favorito cadastrado. Clique em "Novo Favorito" para começar.'
            }
          </p>
        </div>
      )}
    </div>
  );
}