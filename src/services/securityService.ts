// Serviço de segurança com criptografia mais robusta
import CryptoJS from 'crypto-js';

// Função para gerar uma chave secreta mais segura
const generateSecretKey = (): string => {
  // Em produção, você pode querer gerar isso dinamicamente ou obter de uma variável de ambiente
  const baseKey = 'organizerpro-secret-key-2025';
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  
  // Combina informações do ambiente para criar uma chave mais única
  return CryptoJS.SHA256(baseKey + userAgent + platform).toString();
};

// Função para criptografar dados
export const encryptData = (data: string): string => {
  try {
    const secretKey = generateSecretKey();
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    return data; // Retorna os dados não criptografados em caso de erro
  }
};

// Função para descriptografar dados
export const decryptData = (encryptedData: string): string => {
  try {
    const secretKey = generateSecretKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    return encryptedData; // Retorna os dados criptografados em caso de erro
  }
};

// Função para verificar se uma string está criptografada
export const isEncrypted = (data: string): boolean => {
  try {
    // Tentativa simples de verificar se parece com dados criptografados
    // Na prática, você pode querer uma verificação mais robusta
    return data.startsWith('U2FsdGVkX1');
  } catch {
    return false;
  }
};

// Função para salvar dados com criptografia opcional
export const saveSecureData = <T>(key: string, data: T, encrypt: boolean = true): void => {
  try {
    const jsonData = JSON.stringify(data);
    const finalData = encrypt ? encryptData(jsonData) : jsonData;
    localStorage.setItem(key, finalData);
  } catch (error) {
    console.error(`Erro ao salvar dados seguros para ${key}:`, error);
  }
};

// Função para carregar dados com descriptografia automática
export const loadSecureData = <T>(key: string, defaultValue: T, encrypted: boolean = true): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const jsonData = encrypted ? decryptData(stored) : stored;
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Erro ao carregar dados seguros de ${key}:`, error);
    return defaultValue;
  }
};