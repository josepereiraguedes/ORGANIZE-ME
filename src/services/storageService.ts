import { 
  LoginItem, 
  TaskItem, 
  RoutineItem, 
  NoteItem, 
  FavoriteItem, 
  ActivityItem,
  AutomationRule,
  saveToStorage as originalSaveToStorage,
  loadFromStorage as originalLoadFromStorage,
  addActivity as originalAddActivity
} from '@/lib/storage';

// Tipos de dados
export type DataType = 'logins' | 'tasks' | 'routines' | 'notes' | 'favorites' | 'activities';

// Função para gerar IDs únicos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Funções de CRUD para cada tipo de dado
export const storageService = {
  // Logins
  getLogins: (): LoginItem[] => originalLoadFromStorage<LoginItem[]>('logins', [], true),
  saveLogins: (logins: LoginItem[]): void => originalSaveToStorage('logins', logins, true),
  
  // Tasks
  getTasks: (): TaskItem[] => originalLoadFromStorage<TaskItem[]>('tasks', []),
  saveTasks: (tasks: TaskItem[]): void => originalSaveToStorage('tasks', tasks),
  
  // Routines
  getRoutines: (): RoutineItem[] => originalLoadFromStorage<RoutineItem[]>('routines', []),
  saveRoutines: (routines: RoutineItem[]): void => originalSaveToStorage('routines', routines),
  
  // Notes
  getNotes: (): NoteItem[] => originalLoadFromStorage<NoteItem[]>('notes', []),
  saveNotes: (notes: NoteItem[]): void => originalSaveToStorage('notes', notes),
  
  // Favorites
  getFavorites: (): FavoriteItem[] => originalLoadFromStorage<FavoriteItem[]>('favorites', []),
  saveFavorites: (favorites: FavoriteItem[]): void => originalSaveToStorage('favorites', favorites),
  
  // Activities
  getActivities: (): ActivityItem[] => originalLoadFromStorage<ActivityItem[]>('activities', [], true),
  saveActivities: (activities: ActivityItem[]): void => originalSaveToStorage('activities', activities, true),
  
  // Funções utilitárias
  generateId: (): string => generateId(),
  addActivity: (type: ActivityItem['type'], action: string, itemTitle: string): void => 
    originalAddActivity(type, action, itemTitle),
  
  // Automations
  loadAutomations: (): AutomationRule[] => originalLoadFromStorage<AutomationRule[]>('automations', [], true),
  saveAutomations: (automations: AutomationRule[]): void => originalSaveToStorage('automations', automations, true)
}