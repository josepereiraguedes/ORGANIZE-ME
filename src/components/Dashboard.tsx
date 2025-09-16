import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Key, 
  CheckSquare, 
  Repeat, 
  StickyNote, 
  Star, 
  Plus,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from "lucide-react";

export function Dashboard() {
  const quickStats = [
    {
      title: "Logins Salvos",
      value: "12",
      icon: Key,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Tarefas Pendentes",
      value: "8",
      icon: CheckSquare,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Rotinas Ativas",
      value: "5",
      icon: Repeat,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Notas Rápidas",
      value: "15",
      icon: StickyNote,
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const recentTasks = [
    { title: "Revisar relatório mensal", priority: "alta", category: "trabalho", time: "14:30" },
    { title: "Comprar ingredientes", priority: "média", category: "pessoal", time: "16:00" },
    { title: "Agendar consulta médica", priority: "alta", category: "saúde", time: "Amanhã" },
  ];

  const routineProgress = [
    { name: "Exercícios Matinais", completed: 4, total: 7, percentage: 57 },
    { name: "Leitura Diária", completed: 6, total: 7, percentage: 86 },
    { name: "Meditação", completed: 3, total: 7, percentage: 43 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta! Aqui está o resumo da sua organização pessoal.
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={stat.title} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Tarefas Próximas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'alta' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{task.category}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{task.time}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver Todas as Tarefas
            </Button>
          </CardContent>
        </Card>

        {/* Routine Progress */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Progresso das Rotinas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {routineProgress.map((routine, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{routine.name}</p>
                  <span className="text-sm text-muted-foreground">
                    {routine.completed}/{routine.total}
                  </span>
                </div>
                <Progress value={routine.percentage} className="h-2" />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver Todas as Rotinas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Adicionar Login</h3>
            <p className="text-sm text-muted-foreground">Salve um novo login com segurança</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Nova Tarefa</h3>
            <p className="text-sm text-muted-foreground">Organize suas atividades</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Criar Rotina</h3>
            <p className="text-sm text-muted-foreground">Automatize seus hábitos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}