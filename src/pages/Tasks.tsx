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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskItem, saveToStorage, loadFromStorage, generateId, addActivity } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-green-500' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-red-500' }
];

const categories = [
  'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Casa', 'Financeiro', 'Outros'
];

const statusColumns = [
  { id: 'pending', title: 'Pendentes', icon: Circle, color: 'text-gray-500' },
  { id: 'progress', title: 'Em Andamento', icon: PlayCircle, color: 'text-blue-500' },
  { id: 'completed', title: 'Concluídas', icon: CheckCircle, color: 'text-green-500' }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pessoal',
    priority: 'medium' as TaskItem['priority'],
    dueDate: '',
    dueTime: '',
    isRecurring: false,
    recurringType: 'weekly' as TaskItem['recurringType']
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = loadFromStorage<TaskItem[]>('tasks', []);
    setTasks(savedTasks);
  };

  const saveTasks = (newTasks: TaskItem[]) => {
    saveToStorage('tasks', newTasks);
    setTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingTask) {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, updatedAt: now }
          : task
      );
      saveTasks(updatedTasks);
      addActivity('task', 'Editada', formData.title);
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso"
      });
    } else {
      const newTask: TaskItem = {
        id: generateId(),
        ...formData,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      saveTasks([...tasks, newTask]);
      addActivity('task', 'Criada', formData.title);
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Pessoal',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      isRecurring: false,
      recurringType: 'weekly'
    });
    setEditingTask(null);
    setSelectedDate(undefined);
  };

  const handleEdit = (task: TaskItem) => {
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      isRecurring: task.isRecurring,
      recurringType: task.recurringType || 'weekly'
    });
    if (task.dueDate) {
      setSelectedDate(new Date(task.dueDate));
    }
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    addActivity('task', 'Excluída', title);
    toast({
      title: "Sucesso",
      description: "Tarefa excluída com sucesso"
    });
  };

  const moveTask = (taskId: string, newStatus: TaskItem['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
        if (newStatus === 'completed') {
          addActivity('task', 'Concluída', task.title);
        }
        return updatedTask;
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const duplicateTask = (task: TaskItem) => {
    const newTask: TaskItem = {
      ...task,
      id: generateId(),
      title: `${task.title} (Cópia)`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveTasks([...tasks, newTask]);
    addActivity('task', 'Duplicada', newTask.title);
    toast({
      title: "Sucesso",
      description: "Tarefa duplicada com sucesso"
    });
  };

  const getTasksByStatus = (status: TaskItem['status']) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesStatus && matchesSearch && matchesCategory && matchesPriority;
    }).sort((a, b) => {
      // Sort by priority (high -> medium -> low), then by due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const isOverdue = (task: TaskItem) => {
    if (!task.dueDate) return false;
    const dueDateTime = new Date(task.dueDate + (task.dueTime ? `T${task.dueTime}` : ''));
    return dueDateTime < new Date() && task.status !== 'completed';
  };

  const TaskCard = ({ task }: { task: TaskItem }) => {
    const priority = priorities.find(p => p.value === task.priority);
    const overdue = isOverdue(task);
    
    return (
      <Card className={cn("mb-3", overdue && "border-red-500")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{task.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{task.category}</Badge>
                <div className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full", priority?.color)} />
                  <span className="text-xs text-muted-foreground">{priority?.label}</span>
                </div>
                {overdue && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Atrasada
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          
          {(task.dueDate || task.dueTime) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              {task.dueDate && format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
              {task.dueTime && (
                <>
                  <Clock className="w-4 h-4 ml-2" />
                  {task.dueTime}
                </>
              )}
            </div>
          )}

          {task.isRecurring && (
            <Badge variant="outline" className="text-xs">
              Recorrente ({task.recurringType === 'daily' ? 'Diária' : 
                          task.recurringType === 'weekly' ? 'Semanal' : 'Mensal'})
            </Badge>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex gap-1">
              {task.status !== 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveTask(task.id, 'pending')}
                  className="h-8 px-2"
                  title="Mover para Pendentes"
                >
                  <Circle className="h-3 w-3" />
                </Button>
              )}
              {task.status !== 'progress' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveTask(task.id, 'progress')}
                  className="h-8 px-2"
                  title="Mover para Em Andamento"
                >
                  <PlayCircle className="h-3 w-3" />
                </Button>
              )}
              {task.status !== 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveTask(task.id, 'completed')}
                  className="h-8 px-2"
                  title="Marcar como Concluída"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateTask(task)}
                className="h-8 px-2"
                title="Duplicar tarefa"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(task)}
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
                      Tem certeza que deseja excluir a tarefa "{task.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(task.id, task.title)}>
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
        <h1 className="text-3xl font-bold">Gerenciador de Tarefas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a tarefa..."
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
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value: TaskItem['priority']) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData({ ...formData, dueDate: date ? format(date, 'yyyy-MM-dd') : '' });
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="dueTime">Hora</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                  <Label>Tarefa recorrente</Label>
                </div>
                
                {formData.isRecurring && (
                  <Select value={formData.recurringType} onValueChange={(value: TaskItem['recurringType']) => setFormData({ ...formData, recurringType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTask ? 'Atualizar' : 'Criar Tarefa'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
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
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            {priorities.map(priority => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusColumns.map(column => {
          const columnTasks = getTasksByStatus(column.id as TaskItem['status']);
          const ColumnIcon = column.icon;
          
          return (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <ColumnIcon className={cn("h-5 w-5", column.color)} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}