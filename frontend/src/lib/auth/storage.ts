/**
 * Token Storage - Secure localStorage wrapper for JWT tokens
 */

const TOKEN_KEY = 'autoflow_token';
const USER_KEY = 'autoflow_user';

export interface StoredUser {
  user_id: string;
  name: string;
  email: string | null;
  role: string;
}

/**
 * Save JWT token to localStorage
 */
export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

/**
 * Save user info to localStorage
 */
export function saveUser(user: StoredUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

/**
 * Get user info from localStorage
 */
export function getUser(): StoredUser | null {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * Remove user info from localStorage
 */
export function removeUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  removeToken();
  removeUser();
}
