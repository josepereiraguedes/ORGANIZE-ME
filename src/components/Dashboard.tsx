import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Key, 
  CheckSquare, 
  Repeat, 
  StickyNote, 
  Plus,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { logins, tasks, routines, notes } = useAppContext();
  const navigate = useNavigate();
  
  const quickStats = [
    {
      title: "Logins Salvos",
      value: logins.length.toString(),
      icon: Key,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Tarefas Pendentes",
      value: tasks.filter(t => t.status !== 'completed').length.toString(),
      icon: CheckSquare,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Rotinas Ativas",
      value: routines.filter(r => r.isActive).length.toString(),
      icon: Repeat,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Notas Rápidas",
      value: notes.length.toString(),
      icon: StickyNote,
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const recentTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // Ordenar por data de vencimento (dueDate), tarefas sem data no final
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // Se ambas não têm data, ordenar por data de criação (mais recentes primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3)
    .map(task => ({
      title: task.title,
      priority: task.priority,
      category: task.category,
      time: task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem data'
    }));

  const routineProgress = routines
    .filter(routine => routine.isActive)
    .slice(0, 3)
    .map(routine => {
      const totalItems = routine.checklist.length;
      const completedItems = routine.checklist.filter(item => item.completed).length;
      const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        name: routine.title,
        completed: completedItems,
        total: totalItems,
        percentage
      };
    });

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Bem-vindo de volta! Aqui está o resumo da sua organização pessoal.
          </p>
        </div>
        <Button className="btn-gradient w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={stat.title} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Tasks */}
        <Card className="animate-slide-up">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Tarefas Próximas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3 md:space-y-4">
            {recentTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{task.category}</span>
                  </div>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground ml-2">{task.time}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 text-sm">
              Ver Todas as Tarefas
            </Button>
          </CardContent>
        </Card>

        {/* Routine Progress */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Progresso das Rotinas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3 md:space-y-4">
            {routineProgress.map((routine, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{routine.name}</p>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {routine.completed}/{routine.total}
                  </span>
                </div>
                <Progress value={routine.percentage} className="h-2" />
              </div>
            ))}
            {routineProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma rotina ativa</p>
            )}
            <Button variant="outline" className="w-full mt-4 text-sm">
              Ver Todas as Rotinas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="hover-lift cursor-pointer group" onClick={() => navigate('/logins')}>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Adicionar Login</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Salve um novo login com segurança</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group" onClick={() => navigate('/tasks')}>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Nova Tarefa</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Organize suas atividades</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group" onClick={() => navigate('/routines')}>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Criar Rotina</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Automatize seus hábitos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}