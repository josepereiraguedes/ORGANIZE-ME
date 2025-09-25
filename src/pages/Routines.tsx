import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, Trash2, Play, Pause, Clock, CheckCircle, RotateCcw, X } from 'lucide-react';
import { RoutineItem, saveToStorage, loadFromStorage, generateId, addActivity } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek = [
  { value: 'sunday', label: 'Dom', fullName: 'Domingo' },
  { value: 'monday', label: 'Seg', fullName: 'Segunda' },
  { value: 'tuesday', label: 'Ter', fullName: 'Terça' },
  { value: 'wednesday', label: 'Qua', fullName: 'Quarta' },
  { value: 'thursday', label: 'Qui', fullName: 'Quinta' },
  { value: 'friday', label: 'Sex', fullName: 'Sexta' },
  { value: 'saturday', label: 'Sáb', fullName: 'Sábado' }
];

export default function Routines() {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    days: [] as string[],
    time: '',
    isActive: true
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    const savedRoutines = loadFromStorage<RoutineItem[]>('routines', []);
    setRoutines(savedRoutines);
  };

  const saveRoutines = (newRoutines: RoutineItem[]) => {
    saveToStorage('routines', newRoutines);
    setRoutines(newRoutines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || formData.days.length === 0 || !formData.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const validChecklistItems = checklistItems.filter(item => item.trim());
    if (validChecklistItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item no checklist",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    const checklist = validChecklistItems.map(task => ({
      id: generateId(),
      task: task.trim(),
      completed: false
    }));
    
    if (editingRoutine) {
      const updatedRoutines = routines.map(routine => 
        routine.id === editingRoutine.id 
          ? { ...routine, ...formData, checklist }
          : routine
      );
      saveRoutines(updatedRoutines);
      addActivity('routine', 'Editada', formData.title);
      toast({
        title: "Sucesso",
        description: "Rotina atualizada com sucesso"
      });
    } else {
      const newRoutine: RoutineItem = {
        id: generateId(),
        ...formData,
        checklist,
        createdAt: now
      };
      saveRoutines([...routines, newRoutine]);
      addActivity('routine', 'Criada', formData.title);
      toast({
        title: "Sucesso",
        description: "Rotina criada com sucesso"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      days: [],
      time: '',
      isActive: true
    });
    setChecklistItems(['']);
    setEditingRoutine(null);
  };

  const handleEdit = (routine: RoutineItem) => {
    setFormData({
      title: routine.title,
      description: routine.description,
      days: routine.days,
      time: routine.time,
      isActive: routine.isActive
    });
    setChecklistItems(routine.checklist.map(item => item.task));
    setEditingRoutine(routine);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const updatedRoutines = routines.filter(routine => routine.id !== id);
    saveRoutines(updatedRoutines);
    addActivity('routine', 'Excluída', title);
    toast({
      title: "Sucesso",
      description: "Rotina excluída com sucesso"
    });
  };

  const toggleRoutineStatus = (id: string) => {
    const updatedRoutines = routines.map(routine => 
      routine.id === id 
        ? { ...routine, isActive: !routine.isActive }
        : routine
    );
    saveRoutines(updatedRoutines);
  };

  const toggleChecklistItem = (routineId: string, checklistItemId: string) => {
    const updatedRoutines = routines.map(routine => {
      if (routine.id === routineId) {
        const updatedChecklist = routine.checklist.map(item =>
          item.id === checklistItemId
            ? { ...item, completed: !item.completed }
            : item
        );
        return { ...routine, checklist: updatedChecklist };
      }
      return routine;
    });
    saveRoutines(updatedRoutines);
  };

  const completeRoutine = (id: string, title: string) => {
    const updatedRoutines = routines.map(routine => 
      routine.id === id 
        ? { 
            ...routine, 
            lastCompleted: new Date().toISOString(),
            checklist: routine.checklist.map(item => ({ ...item, completed: true }))
          }
        : routine
    );
    saveRoutines(updatedRoutines);
    addActivity('routine', 'Concluída', title);
    toast({
      title: "Parabéns!",
      description: `Rotina "${title}" concluída com sucesso`
    });
  };

  const resetRoutineProgress = (id: string) => {
    const updatedRoutines = routines.map(routine => 
      routine.id === id 
        ? { 
            ...routine, 
            checklist: routine.checklist.map(item => ({ ...item, completed: false }))
          }
        : routine
    );
    saveRoutines(updatedRoutines);
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getRoutineProgress = (routine: RoutineItem) => {
    const completedItems = routine.checklist.filter(item => item.completed).length;
    return Math.round((completedItems / routine.checklist.length) * 100);
  };

  const isRoutineActiveToday = (routine: RoutineItem) => {
    const today = new Date().getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return routine.days.includes(dayNames[today]);
  };

  const filteredRoutines = routines
    .filter(routine => 
      routine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Active routines for today first
      const aActiveToday = isRoutineActiveToday(a) && a.isActive;
      const bActiveToday = isRoutineActiveToday(b) && b.isActive;
      
      if (aActiveToday && !bActiveToday) return -1;
      if (!aActiveToday && bActiveToday) return 1;
      
      // Then by time
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizador de Rotinas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Rotina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Exercícios matinais, Estudar inglês..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua rotina..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Dias da Semana *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.days.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="min-w-12"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecionados: {formData.days.map(day => 
                    daysOfWeek.find(d => d.value === day)?.fullName
                  ).join(', ')}
                </p>
              </div>

              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div>
                <Label>Checklist *</Label>
                <div className="space-y-2 mt-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        placeholder={`Item ${index + 1}...`}
                        className="flex-1"
                      />
                      {checklistItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChecklistItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChecklistItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Rotina ativa</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingRoutine ? 'Atualizar' : 'Criar Rotina'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar rotinas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRoutines.map(routine => {
          const progress = getRoutineProgress(routine);
          const isActiveToday = isRoutineActiveToday(routine);
          const completedToday = routine.lastCompleted && 
            new Date(routine.lastCompleted).toDateString() === new Date().toDateString();
          
          return (
            <Card key={routine.id} className={`${isActiveToday && routine.isActive ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{routine.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {isActiveToday && routine.isActive && (
                        <Badge variant="default">Hoje</Badge>
                      )}
                      {!routine.isActive && (
                        <Badge variant="secondary">Pausada</Badge>
                      )}
                      {completedToday && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluída Hoje
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRoutineStatus(routine.id)}
                  >
                    {routine.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {routine.description && (
                  <p className="text-sm text-muted-foreground">{routine.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {routine.time}
                  <span className="mx-2">•</span>
                  {routine.days.map(day => 
                    daysOfWeek.find(d => d.value === day)?.label
                  ).join(', ')}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Checklist</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetRoutineProgress(routine.id)}
                      className="h-6 px-2"
                      title="Resetar progresso"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {routine.checklist.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(routine.id, item.id)}
                          disabled={!routine.isActive}
                        />
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {routine.lastCompleted && (
                  <div className="text-xs text-muted-foreground">
                    Última conclusão: {new Date(routine.lastCompleted).toLocaleString('pt-BR')}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  {progress === 100 && !completedToday && (
                    <Button
                      size="sm"
                      onClick={() => completeRoutine(routine.id, routine.title)}
                      className="flex-1 mr-2"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar como Concluída
                    </Button>
                  )}
                  
                  <div className="flex gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(routine)}
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
                            Tem certeza que deseja excluir a rotina "{routine.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(routine.id, routine.title)}>
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

      {filteredRoutines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Nenhuma rotina encontrada com o termo pesquisado.'
              : 'Nenhuma rotina cadastrada. Clique em "Nova Rotina" para começar.'
            }
          </p>
        </div>
      )}
    </div>
  );
}