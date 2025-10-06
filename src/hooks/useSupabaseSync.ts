import { useEffect, useCallback } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { 
  supabaseLoginService, 
  supabaseTaskService, 
  supabaseRoutineService, 
  supabaseNoteService, 
  supabaseFavoriteService,
  syncLocalDataWithSupabase
} from '@/services/supabase/supabaseService'

export const useSupabaseSync = () => {
  const {
    logins,
    tasks,
    routines,
    notes,
    favorites,
    loadLogins,
    loadTasks,
    loadRoutines,
    loadNotes,
    loadFavorites
  } = useAppContext()

  // Função para sincronizar dados locais com o Supabase
  const syncLocalData = useCallback(async () => {
    try {
      await syncLocalDataWithSupabase(logins, tasks, routines, notes, favorites)
      console.log('Local data synchronized with Supabase')
    } catch (error) {
      console.error('Failed to sync local data with Supabase:', error)
    }
  }, [logins, tasks, routines, notes, favorites])

  // Função para carregar dados do Supabase
  const loadSupabaseData = useCallback(async () => {
    try {
      // Carregar dados do Supabase
      const supabaseLogins = await supabaseLoginService.getAll()
      const supabaseTasks = await supabaseTaskService.getAll()
      const supabaseRoutines = await supabaseRoutineService.getAll()
      const supabaseNotes = await supabaseNoteService.getAll()
      const supabaseFavorites = await supabaseFavoriteService.getAll()
      
      // Atualizar o estado local com os dados do Supabase
      // Note: Em uma implementação completa, você pode querer mesclar os dados
      // ou permitir que o usuário escolha quais dados manter
      console.log('Data loaded from Supabase:', {
        logins: supabaseLogins.length,
        tasks: supabaseTasks.length,
        routines: supabaseRoutines.length,
        notes: supabaseNotes.length,
        favorites: supabaseFavorites.length
      })
      
      // Aqui você pode decidir como integrar os dados do Supabase com os dados locais
      // Por exemplo, você pode atualizar o estado local ou mostrar uma opção para o usuário
      
    } catch (error) {
      console.error('Failed to load data from Supabase:', error)
    }
  }, [])

  // Efeito para sincronizar dados quando o componente monta
  useEffect(() => {
    // Sincronizar dados locais com o Supabase quando o app inicializa
    syncLocalData()
    
    // Opcionalmente, carregar dados do Supabase
    // loadSupabaseData()
  }, [syncLocalData, loadSupabaseData])

  return {
    syncLocalData,
    loadSupabaseData
  }
}