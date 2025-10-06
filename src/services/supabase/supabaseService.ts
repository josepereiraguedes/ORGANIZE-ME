import { supabase, SupabaseLogin, SupabaseTask, SupabaseRoutine, SupabaseNote, SupabaseFavorite } from './client'
import { LoginItem, TaskItem, RoutineItem, NoteItem, FavoriteItem } from '@/lib/storage'

// Função para converter dados do AppContext para o formato do Supabase
const convertToSupabaseLogin = (login: LoginItem): SupabaseLogin => ({
  id: login.id,
  title: login.title,
  username: login.email || '',
  password: login.password || '',
  url: login.website || '',
  category: login.category || 'general',
  notes: login.notes || '',
  created_at: login.createdAt || new Date().toISOString(),
  updated_at: login.updatedAt || new Date().toISOString()
})

const convertToSupabaseTask = (task: TaskItem): SupabaseTask => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  priority: task.priority || 'medium',
  status: task.status === 'pending' ? 'todo' : 
          task.status === 'progress' ? 'in-progress' : 
          task.status === 'completed' ? 'done' : 'todo',
  due_date: task.dueDate || new Date().toISOString(),
  category: task.category || 'general',
  created_at: task.createdAt || new Date().toISOString(),
  updated_at: task.updatedAt || new Date().toISOString()
})

const convertToSupabaseRoutine = (routine: RoutineItem): SupabaseRoutine => ({
  id: routine.id,
  title: routine.title,
  description: routine.description || '',
  frequency: 'daily', // Mapeamento fixo pois os tipos são diferentes
  time: routine.time || '09:00',
  days: routine.days || [],
  active: routine.isActive !== undefined ? routine.isActive : true,
  created_at: routine.createdAt || new Date().toISOString(),
  updated_at: routine.lastCompleted || new Date().toISOString()
})

const convertToSupabaseNote = (note: NoteItem): SupabaseNote => ({
  id: note.id,
  title: note.title,
  content: note.content || '',
  category: 'general', // Notas não têm categoria no modelo atual
  tags: note.tags || [],
  created_at: note.createdAt || new Date().toISOString(),
  updated_at: note.updatedAt || new Date().toISOString()
})

const convertToSupabaseFavorite = (favorite: FavoriteItem): SupabaseFavorite => ({
  id: favorite.id,
  title: favorite.title,
  url: favorite.url || '',
  category: favorite.category || 'general',
  notes: favorite.description || '',
  created_at: favorite.createdAt || new Date().toISOString(),
  updated_at: favorite.createdAt || new Date().toISOString() // Favoritos não têm updatedAt
})

// Função para converter dados do Supabase para o formato do AppContext
const convertFromSupabaseLogin = (login: SupabaseLogin): LoginItem => ({
  id: login.id,
  title: login.title,
  email: login.username,
  password: login.password,
  website: login.url,
  category: login.category,
  notes: login.notes,
  isFavorite: false, // Este campo não existe no Supabase
  createdAt: login.created_at,
  updatedAt: login.updated_at
})

const convertFromSupabaseTask = (task: SupabaseTask): TaskItem => ({
  id: task.id,
  title: task.title,
  description: task.description,
  category: task.category,
  priority: task.priority,
  status: task.status === 'todo' ? 'pending' : 
          task.status === 'in-progress' ? 'progress' : 
          task.status === 'done' ? 'completed' : 'pending',
  dueDate: task.due_date,
  dueTime: '', // Este campo não existe no Supabase
  isRecurring: false, // Este campo não existe no Supabase
  createdAt: task.created_at,
  updatedAt: task.updated_at
})

const convertFromSupabaseRoutine = (routine: SupabaseRoutine): RoutineItem => ({
  id: routine.id,
  title: routine.title,
  description: routine.description,
  days: routine.days,
  time: routine.time,
  checklist: [], // Este campo não existe no Supabase
  isActive: routine.active,
  createdAt: routine.created_at,
  lastCompleted: routine.updated_at
})

const convertFromSupabaseNote = (note: SupabaseNote): NoteItem => ({
  id: note.id,
  title: note.title,
  content: note.content,
  tags: note.tags,
  isPinned: false, // Este campo não existe no Supabase
  createdAt: note.created_at,
  updatedAt: note.updated_at
})

const convertFromSupabaseFavorite = (favorite: SupabaseFavorite): FavoriteItem => ({
  id: favorite.id,
  title: favorite.title,
  url: favorite.url,
  description: favorite.notes,
  icon: '', // Este campo não existe no Supabase
  category: favorite.category,
  createdAt: favorite.created_at
})

// Serviços para Logins
export const supabaseLoginService = {
  getAll: async (): Promise<LoginItem[]> => {
    const { data, error } = await supabase
      .from('logins')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(convertFromSupabaseLogin)
  },

  getById: async (id: string): Promise<LoginItem | null> => {
    const { data, error } = await supabase
      .from('logins')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data ? convertFromSupabaseLogin(data) : null
  },

  create: async (login: LoginItem): Promise<LoginItem> => {
    const supabaseLogin = convertToSupabaseLogin(login)
    const { data, error } = await supabase
      .from('logins')
      .insert(supabaseLogin)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseLogin(data)
  },

  update: async (id: string, login: Partial<LoginItem>): Promise<LoginItem> => {
    // Obter o login existente
    const existingLogin = await supabaseLoginService.getById(id)
    if (!existingLogin) throw new Error('Login not found')
    
    // Mesclar as alterações com o login existente
    const updatedLogin = { ...existingLogin, ...login, updatedAt: new Date().toISOString() }
    const supabaseLogin = convertToSupabaseLogin(updatedLogin)
    
    const { data, error } = await supabase
      .from('logins')
      .update(supabaseLogin)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseLogin(data)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('logins')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Tarefas
export const supabaseTaskService = {
  getAll: async (): Promise<TaskItem[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(convertFromSupabaseTask)
  },

  getById: async (id: string): Promise<TaskItem | null> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data ? convertFromSupabaseTask(data) : null
  },

  create: async (task: TaskItem): Promise<TaskItem> => {
    const supabaseTask = convertToSupabaseTask(task)
    const { data, error } = await supabase
      .from('tasks')
      .insert(supabaseTask)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseTask(data)
  },

  update: async (id: string, task: Partial<TaskItem>): Promise<TaskItem> => {
    // Obter a tarefa existente
    const existingTask = await supabaseTaskService.getById(id)
    if (!existingTask) throw new Error('Task not found')
    
    // Mesclar as alterações com a tarefa existente
    const updatedTask = { ...existingTask, ...task, updatedAt: new Date().toISOString() }
    const supabaseTask = convertToSupabaseTask(updatedTask)
    
    const { data, error } = await supabase
      .from('tasks')
      .update(supabaseTask)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseTask(data)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Rotinas
export const supabaseRoutineService = {
  getAll: async (): Promise<RoutineItem[]> => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(convertFromSupabaseRoutine)
  },

  getById: async (id: string): Promise<RoutineItem | null> => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data ? convertFromSupabaseRoutine(data) : null
  },

  create: async (routine: RoutineItem): Promise<RoutineItem> => {
    const supabaseRoutine = convertToSupabaseRoutine(routine)
    const { data, error } = await supabase
      .from('routines')
      .insert(supabaseRoutine)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseRoutine(data)
  },

  update: async (id: string, routine: Partial<RoutineItem>): Promise<RoutineItem> => {
    // Obter a rotina existente
    const existingRoutine = await supabaseRoutineService.getById(id)
    if (!existingRoutine) throw new Error('Routine not found')
    
    // Mesclar as alterações com a rotina existente
    const updatedRoutine = { ...existingRoutine, ...routine, lastCompleted: new Date().toISOString() }
    const supabaseRoutine = convertToSupabaseRoutine(updatedRoutine)
    
    const { data, error } = await supabase
      .from('routines')
      .update(supabaseRoutine)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseRoutine(data)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Notas
export const supabaseNoteService = {
  getAll: async (): Promise<NoteItem[]> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(convertFromSupabaseNote)
  },

  getById: async (id: string): Promise<NoteItem | null> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data ? convertFromSupabaseNote(data) : null
  },

  create: async (note: NoteItem): Promise<NoteItem> => {
    const supabaseNote = convertToSupabaseNote(note)
    const { data, error } = await supabase
      .from('notes')
      .insert(supabaseNote)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseNote(data)
  },

  update: async (id: string, note: Partial<NoteItem>): Promise<NoteItem> => {
    // Obter a nota existente
    const existingNote = await supabaseNoteService.getById(id)
    if (!existingNote) throw new Error('Note not found')
    
    // Mesclar as alterações com a nota existente
    const updatedNote = { ...existingNote, ...note, updatedAt: new Date().toISOString() }
    const supabaseNote = convertToSupabaseNote(updatedNote)
    
    const { data, error } = await supabase
      .from('notes')
      .update(supabaseNote)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseNote(data)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Favoritos
export const supabaseFavoriteService = {
  getAll: async (): Promise<FavoriteItem[]> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(convertFromSupabaseFavorite)
  },

  getById: async (id: string): Promise<FavoriteItem | null> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data ? convertFromSupabaseFavorite(data) : null
  },

  create: async (favorite: FavoriteItem): Promise<FavoriteItem> => {
    const supabaseFavorite = convertToSupabaseFavorite(favorite)
    const { data, error } = await supabase
      .from('favorites')
      .insert(supabaseFavorite)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseFavorite(data)
  },

  update: async (id: string, favorite: Partial<FavoriteItem>): Promise<FavoriteItem> => {
    // Obter o favorito existente
    const existingFavorite = await supabaseFavoriteService.getById(id)
    if (!existingFavorite) throw new Error('Favorite not found')
    
    // Mesclar as alterações com o favorito existente
    const updatedFavorite = { ...existingFavorite, ...favorite }
    const supabaseFavorite = convertToSupabaseFavorite(updatedFavorite)
    
    const { data, error } = await supabase
      .from('favorites')
      .update(supabaseFavorite)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertFromSupabaseFavorite(data)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Função para sincronizar dados locais com o Supabase
export const syncLocalDataWithSupabase = async (
  localLogins: LoginItem[],
  localTasks: TaskItem[],
  localRoutines: RoutineItem[],
  localNotes: NoteItem[],
  localFavorites: FavoriteItem[]
): Promise<void> => {
  try {
    // Sincronizar logins
    for (const login of localLogins) {
      try {
        await supabaseLoginService.create(login)
      } catch (error) {
        console.warn('Failed to sync login:', login.id, error)
      }
    }

    // Sincronizar tarefas
    for (const task of localTasks) {
      try {
        await supabaseTaskService.create(task)
      } catch (error) {
        console.warn('Failed to sync task:', task.id, error)
      }
    }

    // Sincronizar rotinas
    for (const routine of localRoutines) {
      try {
        await supabaseRoutineService.create(routine)
      } catch (error) {
        console.warn('Failed to sync routine:', routine.id, error)
      }
    }

    // Sincronizar notas
    for (const note of localNotes) {
      try {
        await supabaseNoteService.create(note)
      } catch (error) {
        console.warn('Failed to sync note:', note.id, error)
      }
    }

    // Sincronizar favoritos
    for (const favorite of localFavorites) {
      try {
        await supabaseFavoriteService.create(favorite)
      } catch (error) {
        console.warn('Failed to sync favorite:', favorite.id, error)
      }
    }

    console.log('Data synchronization completed')
  } catch (error) {
    console.error('Error during data synchronization:', error)
    throw error
  }
}