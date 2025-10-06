import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LoginItem, TaskItem, RoutineItem, NoteItem, FavoriteItem, ActivityItem } from '@/lib/storage';
import { storageService } from '@/services/storageService';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';

// Definição dos tipos de estado
interface AppState {
  logins: LoginItem[];
  tasks: TaskItem[];
  routines: RoutineItem[];
  notes: NoteItem[];
  favorites: FavoriteItem[];
  activities: ActivityItem[];
}

// Definição das ações
type Action =
  | { type: 'SET_LOGINS'; payload: LoginItem[] }
  | { type: 'SET_TASKS'; payload: TaskItem[] }
  | { type: 'SET_ROUTINES'; payload: RoutineItem[] }
  | { type: 'SET_NOTES'; payload: NoteItem[] }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'SET_ACTIVITIES'; payload: ActivityItem[] }
  | { type: 'ADD_LOGIN'; payload: LoginItem }
  | { type: 'ADD_TASK'; payload: TaskItem }
  | { type: 'ADD_ROUTINE'; payload: RoutineItem }
  | { type: 'ADD_NOTE'; payload: NoteItem }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'UPDATE_LOGIN'; payload: LoginItem }
  | { type: 'UPDATE_TASK'; payload: TaskItem }
  | { type: 'UPDATE_ROUTINE'; payload: RoutineItem }
  | { type: 'UPDATE_NOTE'; payload: NoteItem }
  | { type: 'UPDATE_FAVORITE'; payload: FavoriteItem }
  | { type: 'DELETE_LOGIN'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'DELETE_ROUTINE'; payload: string }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'DELETE_FAVORITE'; payload: string };

// Estado inicial
const initialState: AppState = {
  logins: [],
  tasks: [],
  routines: [],
  notes: [],
  favorites: [],
  activities: []
};

// Reducer para gerenciar o estado
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOGINS':
      return { ...state, logins: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_ROUTINES':
      return { ...state, routines: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    
    case 'ADD_LOGIN':
      return { ...state, logins: [...state.logins, action.payload] };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'ADD_ROUTINE':
      return { ...state, routines: [...state.routines, action.payload] };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'ADD_FAVORITE':
      return { ...state, favorites: [...state.favorites, action.payload] };
    
    case 'UPDATE_LOGIN':
      return { 
        ...state, 
        logins: state.logins.map(login => 
          login.id === action.payload.id ? action.payload : login
        ) 
      };
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ) 
      };
    case 'UPDATE_ROUTINE':
      return { 
        ...state, 
        routines: state.routines.map(routine => 
          routine.id === action.payload.id ? action.payload : routine
        ) 
      };
    case 'UPDATE_NOTE':
      return { 
        ...state, 
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        ) 
      };
    case 'UPDATE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.map(favorite => 
          favorite.id === action.payload.id ? action.payload : favorite
        ) 
      };
    
    case 'DELETE_LOGIN':
      return { 
        ...state, 
        logins: state.logins.filter(login => login.id !== action.payload) 
      };
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(task => task.id !== action.payload) 
      };
    case 'DELETE_ROUTINE':
      return { 
        ...state, 
        routines: state.routines.filter(routine => routine.id !== action.payload) 
      };
    case 'DELETE_NOTE':
      return { 
        ...state, 
        notes: state.notes.filter(note => note.id !== action.payload) 
      };
    case 'DELETE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.filter(favorite => favorite.id !== action.payload) 
      };
    
    default:
      return state;
  }
}

// Tipo do contexto
interface AppContextType extends AppState {
  // Funções para carregar dados
  loadLogins: () => void;
  loadTasks: () => void;
  loadRoutines: () => void;
  loadNotes: () => void;
  loadFavorites: () => void;
  loadActivities: () => void;
  
  // Funções CRUD para logins
  addLogin: (login: LoginItem) => void;
  updateLogin: (login: LoginItem) => void;
  deleteLogin: (id: string) => void;
  
  // Funções CRUD para tarefas
  addTask: (task: TaskItem) => void;
  updateTask: (task: TaskItem) => void;
  deleteTask: (id: string) => void;
  
  // Funções CRUD para rotinas
  addRoutine: (routine: RoutineItem) => void;
  updateRoutine: (routine: RoutineItem) => void;
  deleteRoutine: (id: string) => void;
  
  // Funções CRUD para notas
  addNote: (note: NoteItem) => void;
  updateNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  
  // Funções CRUD para favoritos
  addFavorite: (favorite: FavoriteItem) => void;
  updateFavorite: (favorite: FavoriteItem) => void;
  deleteFavorite: (id: string) => void;
  
  // Funções de sincronização com Supabase
  syncWithSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
}

// Criação do contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider do contexto
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { syncLocalData, loadSupabaseData } = useSupabaseSync();

  // Funções para carregar dados
  const loadLogins = () => {
    const logins = storageService.getLogins();
    dispatch({ type: 'SET_LOGINS', payload: logins });
  };

  const loadTasks = () => {
    const tasks = storageService.getTasks();
    dispatch({ type: 'SET_TASKS', payload: tasks });
  };

  const loadRoutines = () => {
    const routines = storageService.getRoutines();
    dispatch({ type: 'SET_ROUTINES', payload: routines });
  };

  const loadNotes = () => {
    const notes = storageService.getNotes();
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const loadFavorites = () => {
    const favorites = storageService.getFavorites();
    dispatch({ type: 'SET_FAVORITES', payload: favorites });
  };

  const loadActivities = () => {
    const activities = storageService.getActivities();
    dispatch({ type: 'SET_ACTIVITIES', payload: activities });
  };

  // Funções de sincronização com Supabase
  const syncWithSupabase = async () => {
    await syncLocalData();
  };

  const loadFromSupabase = async () => {
    await loadSupabaseData();
  };

  // Carregar todos os dados na inicialização
  useEffect(() => {
    loadLogins();
    loadTasks();
    loadRoutines();
    loadNotes();
    loadFavorites();
    loadActivities();
  }, []);

  // Funções CRUD para logins
  const addLogin = (login: LoginItem) => {
    storageService.saveLogins([...state.logins, login]);
    dispatch({ type: 'ADD_LOGIN', payload: login });
    storageService.addActivity('login', 'Criado', login.title);
  };

  const updateLogin = (login: LoginItem) => {
    const updatedLogin = { ...login, updatedAt: new Date().toISOString() };
    const updatedLogins = state.logins.map(item => 
      item.id === login.id ? updatedLogin : item
    );
    storageService.saveLogins(updatedLogins);
    dispatch({ type: 'UPDATE_LOGIN', payload: updatedLogin });
    storageService.addActivity('login', 'Editado', login.title);
  };

  const deleteLogin = (id: string) => {
    const loginToDelete = state.logins.find(login => login.id === id);
    if (loginToDelete) {
      const updatedLogins = state.logins.filter(login => login.id !== id);
      storageService.saveLogins(updatedLogins);
      dispatch({ type: 'DELETE_LOGIN', payload: id });
      storageService.addActivity('login', 'Excluído', loginToDelete.title);
    }
  };

  // Funções CRUD para tarefas
  const addTask = (task: TaskItem) => {
    storageService.saveTasks([...state.tasks, task]);
    dispatch({ type: 'ADD_TASK', payload: task });
    storageService.addActivity('task', 'Criada', task.title);
  };

  const updateTask = (task: TaskItem) => {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    const updatedTasks = state.tasks.map(item => 
      item.id === task.id ? updatedTask : item
    );
    storageService.saveTasks(updatedTasks);
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    storageService.addActivity('task', 'Editada', task.title);
  };

  const deleteTask = (id: string) => {
    const taskToDelete = state.tasks.find(task => task.id === id);
    if (taskToDelete) {
      const updatedTasks = state.tasks.filter(task => task.id !== id);
      storageService.saveTasks(updatedTasks);
      dispatch({ type: 'DELETE_TASK', payload: id });
      storageService.addActivity('task', 'Excluída', taskToDelete.title);
    }
  };

  // Funções CRUD para rotinas
  const addRoutine = (routine: RoutineItem) => {
    storageService.saveRoutines([...state.routines, routine]);
    dispatch({ type: 'ADD_ROUTINE', payload: routine });
    storageService.addActivity('routine', 'Criada', routine.title);
  };

  const updateRoutine = (routine: RoutineItem) => {
    const updatedRoutine = { ...routine, updatedAt: new Date().toISOString() };
    const updatedRoutines = state.routines.map(item => 
      item.id === routine.id ? updatedRoutine : item
    );
    storageService.saveRoutines(updatedRoutines);
    dispatch({ type: 'UPDATE_ROUTINE', payload: updatedRoutine });
    storageService.addActivity('routine', 'Editada', routine.title);
  };

  const deleteRoutine = (id: string) => {
    const routineToDelete = state.routines.find(routine => routine.id === id);
    if (routineToDelete) {
      const updatedRoutines = state.routines.filter(routine => routine.id !== id);
      storageService.saveRoutines(updatedRoutines);
      dispatch({ type: 'DELETE_ROUTINE', payload: id });
      storageService.addActivity('routine', 'Excluída', routineToDelete.title);
    }
  };

  // Funções CRUD para notas
  const addNote = (note: NoteItem) => {
    storageService.saveNotes([...state.notes, note]);
    dispatch({ type: 'ADD_NOTE', payload: note });
    storageService.addActivity('note', 'Criada', note.title);
  };

  const updateNote = (note: NoteItem) => {
    const updatedNote = { ...note, updatedAt: new Date().toISOString() };
    const updatedNotes = state.notes.map(item => 
      item.id === note.id ? updatedNote : item
    );
    storageService.saveNotes(updatedNotes);
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    storageService.addActivity('note', 'Editada', note.title);
  };

  const deleteNote = (id: string) => {
    const noteToDelete = state.notes.find(note => note.id === id);
    if (noteToDelete) {
      const updatedNotes = state.notes.filter(note => note.id !== id);
      storageService.saveNotes(updatedNotes);
      dispatch({ type: 'DELETE_NOTE', payload: id });
      storageService.addActivity('note', 'Excluída', noteToDelete.title);
    }
  };

  // Funções CRUD para favoritos
  const addFavorite = (favorite: FavoriteItem) => {
    storageService.saveFavorites([...state.favorites, favorite]);
    dispatch({ type: 'ADD_FAVORITE', payload: favorite });
    storageService.addActivity('favorite', 'Criado', favorite.title);
  };

  const updateFavorite = (favorite: FavoriteItem) => {
    const updatedFavorite = { ...favorite, updatedAt: new Date().toISOString() };
    const updatedFavorites = state.favorites.map(item => 
      item.id === favorite.id ? updatedFavorite : item
    );
    storageService.saveFavorites(updatedFavorites);
    dispatch({ type: 'UPDATE_FAVORITE', payload: updatedFavorite });
    storageService.addActivity('favorite', 'Editado', favorite.title);
  };

  const deleteFavorite = (id: string) => {
    const favoriteToDelete = state.favorites.find(favorite => favorite.id === id);
    if (favoriteToDelete) {
      const updatedFavorites = state.favorites.filter(favorite => favorite.id !== id);
      storageService.saveFavorites(updatedFavorites);
      dispatch({ type: 'DELETE_FAVORITE', payload: id });
      storageService.addActivity('favorite', 'Excluído', favoriteToDelete.title);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        loadLogins,
        loadTasks,
        loadRoutines,
        loadNotes,
        loadFavorites,
        loadActivities,
        addLogin,
        updateLogin,
        deleteLogin,
        addTask,
        updateTask,
        deleteTask,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        addNote,
        updateNote,
        deleteNote,
        addFavorite,
        updateFavorite,
        deleteFavorite,
        syncWithSupabase,
        loadFromSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};