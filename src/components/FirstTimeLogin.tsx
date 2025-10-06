import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { 
  Key, CheckSquare, Repeat, StickyNote, Star, Calendar, Zap, Shield,
  Clock, Users, Settings, Heart, Book, Mail, Phone, MapPin, Camera,
  Music, Video, FileText, Download, Upload, Lock, Unlock, Eye, EyeOff,
  Home, Building, Car, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
  Wifi, Battery, Bluetooth, Volume2, Mic, MicOff, Play, Pause, SkipForward,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Twitch, Slack,
  Globe, Award, Bell, Cloud, Code, Database, Filter, Gift, Hash, Inbox,
  Layers, Menu, MessageCircle, Monitor, Mouse, Navigation, Package,
  Printer, Radio, RefreshCw, Save, Search, Send, Server, Share, ShoppingCartIcon,
  Tag, Target, Terminal, ThumbsUp, Wrench, Trash2, Tv, Umbrella, UserCheck,
  UserPlus, UsersIcon, Watch, Wind, X, ZapIcon, ZoomIn, ZoomOut
} from "lucide-react";

interface FirstTimeLoginProps {
  onLoginComplete: (userName: string, theme: 'light' | 'dark') => void;
}

// Componente para elementos flutuantes com cores
const FloatingElement = ({ 
  icon: Icon, 
  delay, 
  duration, 
  size,
  color,
  index
}: { 
  icon: React.ElementType, 
  delay: number, 
  duration: number, 
  size: number,
  color: string,
  index: number
}) => {
  // Garantir posição mais espaçada com grid
  const gridSize = 10; // Aumentar o grid para acomodar mais ícones
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  
  // Adicionar variação aleatória controlada
  const variation = 2;
  const left = Math.max(5, Math.min(95, (col * (100 / gridSize)) + (Math.random() * variation * 2 - variation)));
  const top = Math.max(5, Math.min(95, (row * (100 / gridSize)) + (Math.random() * variation * 2 - variation)));
  
  return (
    <div 
      className={`absolute opacity-20 dark:opacity-30 animate-bounce ${color}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        fontSize: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      <Icon />
    </div>
  );
};

export function FirstTimeLogin({ onLoginComplete }: FirstTimeLoginProps) {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      // Salvar nome do usuário e foto no localStorage
      localStorage.setItem('userName', userName.trim());
      
      // Definir tema padrão como light
      const theme = 'light';
      localStorage.setItem('userTheme', theme);
      localStorage.setItem('hasVisited', 'true');
      
      // Salvar foto de perfil se foi selecionada
      if (userPhoto) {
        localStorage.setItem('userPhoto', userPhoto);
      }
      
      // Aplicar o tema (sempre light neste caso)
      document.documentElement.classList.remove("dark");
      
      onLoginComplete(userName.trim(), 'light');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUserPhoto(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUserPhoto(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Ícones para elementos flutuantes com cores
  const floatingIcons = [
    { icon: Key, color: 'text-blue-500' },
    { icon: CheckSquare, color: 'text-green-500' },
    { icon: Repeat, color: 'text-purple-500' },
    { icon: StickyNote, color: 'text-yellow-500' },
    { icon: Star, color: 'text-pink-500' },
    { icon: Calendar, color: 'text-red-500' },
    { icon: Zap, color: 'text-cyan-500' },
    { icon: Shield, color: 'text-indigo-500' },
    { icon: Clock, color: 'text-teal-500' },
    { icon: Users, color: 'text-orange-500' },
    { icon: Settings, color: 'text-gray-500' },
    { icon: Heart, color: 'text-rose-500' },
    { icon: Book, color: 'text-emerald-500' },
    { icon: Mail, color: 'text-violet-500' },
    { icon: Phone, color: 'text-sky-500' },
    { icon: MapPin, color: 'text-lime-500' },
    { icon: Camera, color: 'text-fuchsia-500' },
    { icon: Music, color: 'text-amber-500' },
    { icon: Video, color: 'text-blue-400' },
    { icon: FileText, color: 'text-green-400' },
    { icon: Download, color: 'text-purple-400' },
    { icon: Upload, color: 'text-yellow-400' },
    { icon: Lock, color: 'text-red-400' },
    { icon: Home, color: 'text-cyan-400' },
    { icon: Building, color: 'text-indigo-400' },
    { icon: Car, color: 'text-teal-400' },
    { icon: ShoppingCart, color: 'text-orange-400' },
    { icon: DollarSign, color: 'text-pink-400' },
    { icon: TrendingUp, color: 'text-emerald-400' },
    { icon: Wifi, color: 'text-violet-400' },
    { icon: Battery, color: 'text-amber-400' },
    { icon: Bluetooth, color: 'text-blue-600' },
    { icon: Volume2, color: 'text-green-600' },
    { icon: Mic, color: 'text-purple-600' },
    { icon: Play, color: 'text-red-600' },
    { icon: Pause, color: 'text-yellow-600' },
    { icon: Facebook, color: 'text-blue-600' },
    { icon: Twitter, color: 'text-sky-500' },
    { icon: Instagram, color: 'text-pink-500' },
    { icon: Linkedin, color: 'text-blue-700' },
    { icon: Youtube, color: 'text-red-600' },
    { icon: Github, color: 'text-gray-900 dark:text-gray-100' },
    { icon: Twitch, color: 'text-purple-600' },
    { icon: Slack, color: 'text-purple-500' },
    { icon: Globe, color: 'text-blue-500' },
    { icon: Award, color: 'text-yellow-500' },
    { icon: Bell, color: 'text-orange-500' },
    { icon: Cloud, color: 'text-cyan-500' },
    { icon: Code, color: 'text-purple-500' },
    { icon: Database, color: 'text-green-500' },
    { icon: Filter, color: 'text-red-500' },
    { icon: Gift, color: 'text-pink-500' },
    { icon: Hash, color: 'text-blue-400' },
    { icon: Inbox, color: 'text-indigo-500' },
    { icon: Layers, color: 'text-teal-500' },
    { icon: Menu, color: 'text-gray-500' },
    { icon: MessageCircle, color: 'text-green-400' },
    { icon: Monitor, color: 'text-blue-600' },
    { icon: Mouse, color: 'text-gray-600' },
    { icon: Navigation, color: 'text-cyan-400' },
    { icon: Package, color: 'text-orange-400' },
    { icon: Printer, color: 'text-gray-700' },
    { icon: Radio, color: 'text-red-400' },
    { icon: RefreshCw, color: 'text-blue-500' },
    { icon: Save, color: 'text-green-500' },
    { icon: Search, color: 'text-purple-500' },
    { icon: Send, color: 'text-cyan-500' },
    { icon: Server, color: 'text-gray-500' },
    { icon: Share, color: 'text-yellow-500' },
    { icon: ShoppingCartIcon, color: 'text-orange-500' },
    { icon: Tag, color: 'text-pink-500' },
    { icon: Target, color: 'text-red-600' },
    { icon: Terminal, color: 'text-green-600' },
    { icon: ThumbsUp, color: 'text-blue-400' },
    { icon: Wrench, color: 'text-gray-600' },
    { icon: Trash2, color: 'text-red-500' },
    { icon: Tv, color: 'text-indigo-500' },
    { icon: Umbrella, color: 'text-blue-300' },
    { icon: UserCheck, color: 'text-green-500' },
    { icon: UserPlus, color: 'text-blue-500' },
    { icon: UsersIcon, color: 'text-purple-500' },
    { icon: Watch, color: 'text-gray-500' },
    { icon: Wind, color: 'text-cyan-400' },
    { icon: X, color: 'text-red-500' },
    { icon: ZapIcon, color: 'text-yellow-500' },
    { icon: ZoomIn, color: 'text-blue-500' },
    { icon: ZoomOut, color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 overflow-hidden relative">
      {/* Área para ícones flutuantes - 40% da largura em telas médias+ (lado esquerdo) */}
      <div className="hidden md:flex md:w-2/5 items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden">
          {floatingIcons.map((item, index) => (
            <FloatingElement 
              key={index}
              index={index}
              icon={item.icon}
              delay={index * 0.05} // Reduzir o delay para animações mais suaves
              duration={2 + (index % 8) * 0.2} // Variar a duração da animação
              size={16 + (index % 12)} // Variar o tamanho dos ícones
              color={item.color}
            />
          ))}
        </div>
      </div>
      
      {/* Conteúdo principal - 60% da largura em telas médias+ (lado direito) */}
      <div className="w-full md:w-3/5 flex flex-col items-center justify-center z-10">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-start mb-6">
            <Logo />
          </div>

          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Coluna da esquerda - Formulário de login */}
              <div className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle>Bem-vindo!</CardTitle>
                  <CardDescription>
                    Configure seu perfil para começar a usar o Organize Me
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Seu nome</Label>
                      <Input
                        id="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Digite seu nome"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Foto de perfil (opcional)</Label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragging 
                            ? 'border-primary bg-primary/10' 
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        
                        {userPhoto ? (
                          <div className="flex flex-col items-center">
                            <img 
                              src={userPhoto} 
                              alt="Foto selecionada" 
                              className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                            />
                            <p className="text-sm text-muted-foreground">Clique para alterar</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                <circle cx="12" cy="13" r="5" />
                                <path d="M12 18v2" />
                              </svg>
                            </div>
                            <p className="font-medium">Arraste uma foto ou clique para selecionar</p>
                            <p className="text-sm text-muted-foreground mt-1">Formatos suportados: JPG, PNG (máximo 2MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full btn-gradient" disabled={!userName.trim()}>
                      Começar a usar
                    </Button>
                  </form>
                </CardContent>
              </div>
              
              {/* Coluna da direita - Descrição do app com imagem */}
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-700 p-6 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground">Sua vida digital organizada</h3>
                    <p className="text-muted-foreground text-sm">
                      Gerencie todas as suas senhas, tarefas, rotinas e informações importantes em um único lugar seguro e prático.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Armazene senhas com criptografia de ponta a ponta</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Organize tarefas e crie rotinas personalizadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Repeat className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Automatize processos repetitivos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Acesse de qualquer lugar, a qualquer momento</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Imagem de uma mulher segurando o celular */}
                  <div className="flex justify-center mt-4">
                    <div className="relative">
                      {/* Imagem ilustrativa de uma mulher segurando celular */}
                      <div className="w-40 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                        <div className="relative w-32 h-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center p-2">
                          {/* Barra de status */}
                          <div className="w-full h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg flex items-center justify-between px-2 text-white text-xs">
                            <span>9:41</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* Conteúdo do app */}
                          <div className="flex-1 w-full p-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Shield className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="h-2 bg-blue-200 dark:bg-gray-600 rounded w-3/4"></div>
                                <div className="h-1.5 bg-blue-100 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <CheckSquare className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="h-2 bg-purple-200 dark:bg-gray-600 rounded w-full"></div>
                                <div className="h-1.5 bg-purple-100 dark:bg-gray-700 rounded w-3/4 mt-1"></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <Repeat className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="h-2 bg-green-200 dark:bg-gray-600 rounded w-5/6"></div>
                                <div className="h-1.5 bg-green-100 dark:bg-gray-700 rounded w-2/3 mt-1"></div>
                              </div>
                            </div>
                            
                            {/* Gráfico fictício */}
                            <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow">
                              <div className="h-1.5 bg-blue-200 dark:bg-gray-600 rounded w-3/4 mb-1.5"></div>
                              <div className="h-1.5 bg-green-200 dark:bg-gray-600 rounded w-1/2 mb-1.5"></div>
                              <div className="h-1.5 bg-purple-200 dark:bg-gray-600 rounded w-5/6"></div>
                            </div>
                          </div>
                          
                          {/* Barra de navegação inferior */}
                          <div className="w-full h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-around items-center">
                            <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}