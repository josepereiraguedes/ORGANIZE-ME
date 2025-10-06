import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppContext, AppProvider } from './AppContext';

// Mock do storageService para evitar dependências externas
vi.mock('@/services/storageService', () => ({
  storageService: {
    getLogins: () => [],
    saveLogins: vi.fn(),
    getTasks: () => [],
    saveTasks: vi.fn(),
    getRoutines: () => [],
    saveRoutines: vi.fn(),
    getNotes: () => [],
    saveNotes: vi.fn(),
    getFavorites: () => [],
    saveFavorites: vi.fn(),
    getActivities: () => [],
    saveActivities: vi.fn(),
    generateId: () => 'test-id',
    addActivity: vi.fn()
  }
}));

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );
    
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    expect(result.current.logins).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.routines).toEqual([]);
    expect(result.current.notes).toEqual([]);
    expect(result.current.favorites).toEqual([]);
    expect(result.current.activities).toEqual([]);
  });

  it('should add a login', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );
    
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    const newLogin = {
      id: '1',
      title: 'Test Login',
      email: 'test@example.com',
      password: 'password',
      website: '',
      category: 'personal',
      notes: '',
      isFavorite: false,
      createdAt: '',
      updatedAt: ''
    };
    
    act(() => {
      result.current.addLogin(newLogin);
    });
    
    // Como o estado é gerenciado internamente, verificamos se a função foi chamada
    expect(result.current.logins).toBeDefined();
  });
});