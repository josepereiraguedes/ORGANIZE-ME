// Utility functions for local storage with basic encryption
export interface LoginItem {
  id: string;
  title: string;
  email: string;
  password: string;
  website: string;
  category: string;
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'progress' | 'completed';
  dueDate?: string;
  dueTime?: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  description: string;
  days: string[];
  time: string;
  checklist: { id: string; task: string; completed: boolean }[];
  isActive: boolean;
  createdAt: string;
  lastCompleted?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  category: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'login' | 'task' | 'routine' | 'note' | 'favorite';
  action: string;
  itemTitle: string;
  timestamp: string;
}

// Simple encryption/decryption (basic XOR - for demo purposes)
const ENCRYPTION_KEY = 'OrganizerPro2024';

function simpleEncrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return btoa(result);
}

function simpleDecrypt(encrypted: string): string {
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

// Storage functions
export function saveToStorage<T>(key: string, data: T, encrypt = false): void {
  try {
    const jsonData = JSON.stringify(data);
    const finalData = encrypt ? simpleEncrypt(jsonData) : jsonData;
    localStorage.setItem(key, finalData);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T, encrypted = false): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const jsonData = encrypted ? simpleDecrypt(stored) : stored;
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function addActivity(type: ActivityItem['type'], action: string, itemTitle: string): void {
  const activities = loadFromStorage<ActivityItem[]>('activities', []);
  const newActivity: ActivityItem = {
    id: generateId(),
    type,
    action,
    itemTitle,
    timestamp: new Date().toISOString()
  };
  
  activities.unshift(newActivity);
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100);
  }
  
  saveToStorage('activities', activities);
}
