import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, saveSecureData, loadSecureData } from './securityService';

describe('securityService', () => {
  it('should encrypt and decrypt data correctly', () => {
    const originalData = 'test data';
    const encrypted = encryptData(originalData);
    const decrypted = decryptData(encrypted);
    
    expect(decrypted).toBe(originalData);
    expect(encrypted).not.toBe(originalData);
  });

  it('should save and load secure data correctly', () => {
    const key = 'test-key';
    const data = { name: 'test', value: 123 };
    
    saveSecureData(key, data, true);
    const loaded = loadSecureData(key, {}, true);
    
    expect(loaded).toEqual(data);
    
    // Clean up
    localStorage.removeItem(key);
  });

  it('should handle non-encrypted data correctly', () => {
    const key = 'test-key-plain';
    const data = { name: 'test', value: 123 };
    
    saveSecureData(key, data, false);
    const loaded = loadSecureData(key, {}, false);
    
    expect(loaded).toEqual(data);
    
    // Clean up
    localStorage.removeItem(key);
  });
});