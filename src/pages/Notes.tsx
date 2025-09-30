import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, Pin, Hash, StickyNote } from 'lucide-react';
import { NoteItem, saveToStorage, loadFromStorage, generateId, addActivity } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const predefinedTags = [
  'Ideias', 'Trabalho', 'Estudos', 'Pessoal', 'Projeto', 'Lembretes', 
  'Reuniões', 'Tarefas', 'Receitas', 'Viagem', 'Compras', 'Saúde'
];

export default function Notes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isPinned: false
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = loadFromStorage<NoteItem[]>('notes', []);
    setNotes(savedNotes);
  };

  const saveNotes = (newNotes: NoteItem[]) => {
    saveToStorage('notes', newNotes);
    setNotes(newNotes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingNote) {
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...formData, updatedAt: now }
          : note
      );
      saveNotes(updatedNotes);
      addActivity('note', 'Editada', formData.title);
      toast({
        title: "Sucesso",
        description: "Nota atualizada com sucesso"
      });
    } else {
      const newNote: NoteItem = {
        id: generateId(),
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      saveNotes([...notes, newNote]);
      addActivity('note', 'Criada', formData.title);
      toast({
        title: "Sucesso",
        description: "Nota criada com sucesso"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      isPinned: false
    });
    setEditingNote(null);
    setNewTag('');
  };

  const handleEdit = (note: NoteItem) => {
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      isPinned: note.isPinned
    });
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    addActivity('note', 'Excluída', title);
    toast({
      title: "Sucesso",
      description: "Nota excluída com sucesso"
    });
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
        : note
    );
    saveNotes(updatedNotes);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const duplicateNote = (note: NoteItem) => {
    const newNote: NoteItem = {
      ...note,
      id: generateId(),
      title: `${note.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveNotes([...notes, newNote]);
    addActivity('note', 'Duplicada', newNote.title);
    toast({
      title: "Sucesso",
      description: "Nota duplicada com sucesso"
    });
  };

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by update date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notas Rápidas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
              <DialogDescription>
                {editingNote ? 'Edite os campos abaixo para atualizar sua nota.' : 'Preencha os campos abaixo para criar uma nova nota.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título da nota"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo da nota..."
                  rows={10}
                  className="resize-y"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md min-h-12">
                  {formData.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ✕
                    </Badge>
                  ))}
                  {formData.tags.length === 0 && (
                    <span className="text-muted-foreground text-sm">Nenhuma tag adicionada</span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Digite uma nova tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag}
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground mr-2">Tags sugeridas:</span>
                  {predefinedTags
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 6)
                    .map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isPinned">Fixar nota no topo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingNote ? 'Atualizar' : 'Criar Nota'}
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
              placeholder="Buscar notas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTag === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag('all')}
          >
            Todas
          </Button>
          {allTags.slice(0, 5).map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
          {allTags.length > 5 && (
            <Button variant="outline" size="sm" disabled>
              +{allTags.length - 5}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className={`group relative ${note.isPinned ? 'ring-2 ring-yellow-400' : ''}`}>
            {note.isPinned && (
              <Pin className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <StickyNote className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePin(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                >
                  <Pin className={`h-4 w-4 ${note.isPinned ? 'text-yellow-500 fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground line-clamp-4">
                {note.content}
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                <span>
                  {new Date(note.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(note.updatedAt).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateNote(note)}
                    className="h-6 px-2"
                    title="Duplicar nota"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(note)}
                    className="h-6 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a nota "{note.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(note.id, note.title)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedTag !== 'all'
              ? 'Nenhuma nota encontrada com os filtros aplicados.'
              : 'Nenhuma nota cadastrada. Clique em "Nova Nota" para começar.'
            }
          </p>
        </div>
      )}
    </div>
  );
}