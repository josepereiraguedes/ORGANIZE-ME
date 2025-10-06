import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function Calendar() {
  const { tasks, routines } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getRoutinesForDate = (date: Date) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = dayNames[date.getDay()];
    return routines.filter(routine => routine.isActive && routine.days.includes(dayName));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agenda</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = date.toDateString() === new Date().toDateString();
              const dayTasks = getTasksForDate(date);
              const dayRoutines = getRoutinesForDate(date);
              const hasEvents = dayTasks.length > 0 || dayRoutines.length > 0;

              return (
                <div
                  key={day}
                  className={`
                    min-h-24 p-2 border rounded-lg
                    ${isToday ? 'bg-primary/10 border-primary' : 'border-border'}
                    ${hasEvents ? 'bg-muted/50' : ''}
                    hover:shadow-md transition-shadow
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 bg-blue-100 dark:bg-blue-900/30 rounded truncate"
                        title={task.title}
                      >
                        <Clock className="h-3 w-3 inline mr-1" />
                        {task.title}
                      </div>
                    ))}
                    {dayRoutines.slice(0, 2).map(routine => (
                      <div
                        key={routine.id}
                        className="text-xs p-1 bg-green-100 dark:bg-green-900/30 rounded truncate"
                        title={routine.title}
                      >
                        {routine.title}
                      </div>
                    ))}
                    {(dayTasks.length + dayRoutines.length) > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayTasks.length + dayRoutines.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tarefas Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks
                .filter(task => task.dueDate && task.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.dueDate!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              {tasks.filter(task => task.dueDate && task.status !== 'completed').length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rotinas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routines
                .filter(routine => routine.isActive)
                .slice(0, 5)
                .map(routine => (
                  <div key={routine.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{routine.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {routine.days.join(', ')} às {routine.time}
                      </p>
                    </div>
                  </div>
                ))}
              {routines.filter(routine => routine.isActive).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma rotina ativa</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}