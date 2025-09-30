import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Clock, Bell, Repeat, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
}

export default function Automation() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: 'daily-backup',
      title: 'Backup Automático Diário',
      description: 'Cria backup dos seus dados automaticamente todos os dias',
      icon: Clock,
      enabled: false
    },
    {
      id: 'task-reminder',
      title: 'Lembrete de Tarefas',
      description: 'Notifica sobre tarefas pendentes próximas do prazo',
      icon: Bell,
      enabled: false
    },
    {
      id: 'routine-check',
      title: 'Verificação de Rotinas',
      description: 'Lembra você de executar suas rotinas diárias',
      icon: Repeat,
      enabled: false
    },
    {
      id: 'auto-complete',
      title: 'Auto-completar Rotinas',
      description: 'Marca rotinas como completas automaticamente',
      icon: CheckCircle2,
      enabled: false
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
      )
    );
    
    const automation = automations.find(a => a.id === id);
    toast({
      title: automation?.enabled ? "Automação desativada" : "Automação ativada",
      description: automation?.title
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações</h1>
          <p className="text-muted-foreground mt-1">
            Configure automações para otimizar seu fluxo de trabalho
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          return (
            <Card key={automation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{automation.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {automation.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={automation.id}
                      checked={automation.enabled}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Próximas Funcionalidades</CardTitle>
          </div>
          <CardDescription>
            Recursos de automação que estão em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Integração com calendário externo
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Sincronização entre dispositivos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Webhooks para notificações
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Regras personalizadas de automação
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
