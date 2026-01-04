import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helpers para storage multiplataforma (SecureStore en móvil, AsyncStorage en web)
const storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      await storage.setItem('token', data.access_token);
      set({ token: data.access_token });

      // Obtener info del usuario
      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const userData = await userResponse.json();
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al registrarse');
      }

      const data = await response.json();
      await storage.setItem('token', data.access_token);
      set({ token: data.access_token });

      // Obtener info del usuario
      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const userData = await userResponse.json();
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await storage.deleteItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadToken: async () => {
    try {
      set({ isLoading: true });
      const token = await storage.getItem('token');
      
      if (token) {
        set({ token });
        // Verificar token y obtener usuario
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          set({ user: userData, isAuthenticated: true });
        } else {
          // Token inválido
          await storage.deleteItem('token');
          set({ token: null, user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));