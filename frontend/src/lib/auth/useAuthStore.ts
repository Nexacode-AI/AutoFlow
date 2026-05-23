/**
 * Auth Store - Global authentication state management with Zustand
 */

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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storage.getUser(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,
  error: null,

  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Call login API
      const response = await authApi.login(email, password);
      const token = response.access_token;

      // Get user info with the token
      const user = await authApi.getCurrentUser(token);

      // Save to localStorage
      storage.saveToken(token);
      storage.saveUser(user);

      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    const { token } = get();

    try {
      // Call logout API if we have a token
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage and state
      storage.clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  /**
   * Check if current token is still valid
   */
  checkAuth: async () => {
    const { token } = get();

    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      // Verify token by fetching user info
      const user = await authApi.getCurrentUser(token);

      // Update user info (might have changed)
      storage.saveUser(user);
      set({ user, isAuthenticated: true });
    } catch (error) {
      // Token is invalid - clear auth
      storage.clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
