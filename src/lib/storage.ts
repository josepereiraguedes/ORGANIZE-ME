// Utility functions for local storage with encryption
import { saveSecureData, loadSecureData } from '@/services/securityService';

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

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name for serialization
  enabled: boolean;
}

// Storage functions using the new security service
export function saveToStorage<T>(key: string, data: T, encrypt = false): void {
  saveSecureData(key, data, encrypt);
}

export function loadFromStorage<T>(key: string, defaultValue: T, encrypted = false): T {
  return loadSecureData(key, defaultValue, encrypted);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function addActivity(type: ActivityItem['type'], action: string, itemTitle: string): void {
  const activities = loadFromStorage<ActivityItem[]>('activities', [], true);
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
  
  saveToStorage('activities', activities, true);
}