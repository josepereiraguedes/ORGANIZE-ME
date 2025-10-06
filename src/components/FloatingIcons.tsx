import { 
  Key, CheckSquare, Repeat, StickyNote, Star, Calendar, Zap, Shield,
  Clock, Users, Settings, Heart, Book, Mail, Phone, MapPin, Camera,
  Music, Video, FileText, Download, Upload, Lock, Home, Building, Car, 
  ShoppingCart, DollarSign, TrendingUp, Wifi, Battery, Bluetooth, Volume2, 
  Mic, Play, Pause, Facebook, Twitter, Instagram, Linkedin, Youtube, 
  Github, Twitch, Slack, Globe, Award, Bell, Cloud, Code, Database, 
  Filter, Gift, Hash, Inbox, Layers, Menu, MessageCircle, Monitor, 
  Mouse, Navigation, Package, Printer, Radio, RefreshCw, Save, Search, 
  Send, Server, Share, ShoppingCartIcon, Tag, Target, Terminal, ThumbsUp, 
  Wrench, Trash2, Tv, Umbrella, UserCheck, UserPlus, UsersIcon, Watch, 
  Wind, X, ZapIcon, ZoomIn, ZoomOut
} from "lucide-react";
import { useEffect, useState } from "react";

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

export function FloatingIcons() {
  const [icons, setIcons] = useState<typeof floatingIcons>([]);

  useEffect(() => {
    // Em telas pequenas, reduzir o número de ícones para melhor performance
    const isMobile = window.innerWidth < 768;
    const iconCount = isMobile ? 30 : floatingIcons.length;
    
    // Selecionar ícones aleatoriamente para telas pequenas
    if (isMobile) {
      const shuffled = [...floatingIcons].sort(() => 0.5 - Math.random());
      setIcons(shuffled.slice(0, iconCount));
    } else {
      setIcons(floatingIcons);
    }
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((item, index) => (
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
  );
}