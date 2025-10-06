import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    // Limpar o localStorage antes de cada teste
    localStorage.clear();
  });

  it('should generate unique IDs', () => {
    const id1 = storageService.generateId();
    const id2 = storageService.generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should save and load automations with encryption', () => {
    const automations = [
      {
        id: 'test-1',
        title: 'Test Automation',
        description: 'Test Description',
        icon: 'Clock',
        enabled: true
      }
    ];
    
    // Salvar automações
    storageService.saveAutomations(automations);
    
    // Carregar automações
    const loaded = storageService.loadAutomations();
    
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(automations[0]);
  });
});