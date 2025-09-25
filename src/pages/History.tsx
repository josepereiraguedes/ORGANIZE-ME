import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, History as HistoryIcon, Download, Trash2, Key, CheckSquare, RotateCcw, StickyNote, Star, Clock, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityItem, saveToStorage, loadFromStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const activityTypes = [
  { value: 'all', label: 'Todas as atividades', icon: HistoryIcon },
  { value: 'login', label: 'Logins', icon: Key },
  { value: 'task', label: 'Tarefas', icon: CheckSquare },
  { value: 'routine', label: 'Rotinas', icon: RotateCcw },
  { value: 'note', label: 'Notas', icon: StickyNote },
  { value: 'favorite', label: 'Favoritos', icon: Star }
];

const timeFilters = [
  { value: 'all', label: 'Todo o período' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'last7', label: 'Últimos 7 dias' },
  { value: 'last30', label: 'Últimos 30 dias' }
];

export default function History() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const savedActivities = loadFromStorage<ActivityItem[]>('activities', []);
    setActivities(savedActivities);
  };

  const clearAllHistory = () => {
    saveToStorage('activities', []);
    setActivities([]);
    toast({
      title: "Histórico limpo",
      description: "Todo o histórico de atividades foi removido"
    });
  };

  const exportHistory = () => {
    const csvContent = [
      ['Data/Hora', 'Tipo', 'Ação', 'Item'].join(','),
      ...filteredActivities.map(activity => [
        new Date(activity.timestamp).toLocaleString('pt-BR'),
        getActivityTypeLabel(activity.type),
        activity.action,
        activity.itemTitle
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-organizerpro-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: "Histórico exportado como arquivo CSV"
    });
  };

  const getActivityTypeLabel = (type: ActivityItem['type']) => {
    const typeInfo = activityTypes.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  const getTimeFilterRange = (filter: string) => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        };
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 0 }),
          end: endOfWeek(now, { weekStartsOn: 0 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last7':
        return {
          start: subDays(now, 7),
          end: now
        };
      case 'last30':
        return {
          start: subDays(now, 30),
          end: now
        };
      default:
        return null;
    }
  };

  const filteredActivities = activities.filter(activity => {
    // Filter by search term
    const matchesSearch = activity.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    
    // Filter by time
    let matchesTime = true;
    if (selectedTimeFilter !== 'all') {
      const range = getTimeFilterRange(selectedTimeFilter);
      if (range) {
        const activityDate = new Date(activity.timestamp);
        matchesTime = isWithinInterval(activityDate, range);
      }
    }
    
    return matchesSearch && matchesType && matchesTime;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: ActivityItem['type']) => {
    const typeInfo = activityTypes.find(t => t.value === type);
    return typeInfo?.icon || HistoryIcon;
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return 'text-blue-600 bg-blue-100';
      case 'task': return 'text-green-600 bg-green-100';
      case 'routine': return 'text-purple-600 bg-purple-100';
      case 'note': return 'text-yellow-600 bg-yellow-100';
      case 'favorite': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, ActivityItem[]>);

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  const getActivityStats = () => {
    const stats = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportHistory}
            disabled={filteredActivities.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={activities.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar limpeza</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja limpar todo o histórico de atividades? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllHistory}>
                  Limpar Histórico
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {activityTypes.filter(type => type.value !== 'all').map(type => {
          const count = stats[type.value] || 0;
          const IconComponent = type.icon;
          
          return (
            <Card key={type.value} className="text-center">
              <CardContent className="pt-4">
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${getActivityColor(type.value as ActivityItem['type'])}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{type.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar no histórico..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent>
            {timeFilters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-6">
        {groupedActivities.map(([date, dayActivities]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              {format(new Date(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              <Badge variant="secondary">{dayActivities.length}</Badge>
            </div>
            
            <div className="space-y-2 pl-7 border-l-2 border-muted">
              {dayActivities.map(activity => {
                const IconComponent = getActivityIcon(activity.type);
                
                return (
                  <Card key={activity.id} className="ml-4 relative">
                    <div className="absolute -left-8 top-4 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getActivityTypeLabel(activity.type)}
                          </Badge>
                          <span className="font-medium">{activity.action}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm">{activity.itemTitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {activities.length === 0
              ? 'Nenhuma atividade registrada ainda. Use o app para ver o histórico aparecer aqui.'
              : 'Nenhuma atividade encontrada com os filtros aplicados.'
            }
          </p>
        </div>
      )}
    </div>
  );
}