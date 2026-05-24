import { create } from 'zustand';
import * as authApi from './api';
import * as storage from './storage';

export interface User {
  user_id: string;
  name: string;
  email: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.getUser(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(email, password);
      // Save token first so authedFetch can read it for getCurrentUser
      storage.saveToken(response.access_token);

      const user = await authApi.getCurrentUser();
      storage.saveUser(user);

      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      storage.clearAuth();
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ user: null, isAuthenticated: false, isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      if (storage.getToken()) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      storage.clearAuth();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  checkAuth: async () => {
    if (!storage.getToken()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      storage.saveUser(user);
      set({ user, isAuthenticated: true });
    } catch {
      storage.clearAuth();
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
