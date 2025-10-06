import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateId, addActivity } from './storage';
import { decryptData } from '@/services/securityService';

describe('storage utilities', () => {
  beforeEach(() => {
    // Limpar o localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  it('should add activity to localStorage', () => {
    const mockDate = new Date('2023-01-01T00:00:00.000Z');
    vi.setSystemTime(mockDate);
    
    addActivity('login', 'created', 'Test Login');
    
    // Decrypt the data before parsing
    const encryptedData = localStorage.getItem('activities') || '[]';
    const decryptedData = decryptData(encryptedData);
    const activities = JSON.parse(decryptedData);
    
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      type: 'login',
      action: 'created',
      itemTitle: 'Test Login',
      timestamp: mockDate.toISOString()
    });
    
    // Verificar que o ID foi gerado
    expect(activities[0].id).toBeDefined();
    expect(typeof activities[0].id).toBe('string');
  });

  it('should limit activities to 100 items', () => {
    // Adicionar 101 atividades
    for (let i = 0; i < 101; i++) {
      addActivity('login', 'created', `Login ${i}`);
    }
    
    // Decrypt the data before parsing
    const encryptedData = localStorage.getItem('activities') || '[]';
    const decryptedData = decryptData(encryptedData);
    const activities = JSON.parse(decryptedData);
    
    // Deve manter apenas as últimas 100
    expect(activities).toHaveLength(100);
    
    // A primeira atividade deve ser a número 100 (a mais recente)
    expect(activities[0].itemTitle).toBe('Login 100');
    
    // A última atividade deve ser a número 1 (a mais antiga entre as 100 mantidas)
    expect(activities[99].itemTitle).toBe('Login 1');
  });
});