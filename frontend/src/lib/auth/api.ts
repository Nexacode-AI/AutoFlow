import { getToken } from './storage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  user_id: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: 'bay' | 'admin' | 'super_admin';
}

export interface UserUpdateRequest {
  name?: string;
  role?: 'bay' | 'admin' | 'super_admin';
  is_active?: boolean;
}

export interface ApiError {
  detail: string;
}

function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const error: ApiError = await response.json();
  throw new Error(error.detail || fallback);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) return parseError(response, 'Login failed');
  return response.json();
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/auth/me`);
  if (!response.ok) return parseError(response, 'Failed to get user');
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/auth/logout`, {
    method: 'POST',
  });
  if (!response.ok) return parseError(response, 'Logout failed');
}

export async function refreshToken(): Promise<LoginResponse> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
  });
  if (!response.ok) return parseError(response, 'Token refresh failed');
  return response.json();
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) return parseError(response, 'Failed to request password reset');
  return response.json();
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!response.ok) return parseError(response, 'Failed to reset password');
  return response.json();
}

export async function listUsers(
  filters?: { role?: string; is_active?: boolean },
): Promise<UserResponse[]> {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

  const qs = params.toString();
  const response = await authedFetch(
    `${API_BASE}${API_PREFIX}/users/${qs ? `?${qs}` : ''}`,
  );
  if (!response.ok) return parseError(response, 'Failed to fetch users');
  return response.json();
}

export async function createUser(userData: UserCreateRequest): Promise<UserResponse> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) return parseError(response, 'Failed to create user');
  return response.json();
}

export async function updateUser(
  userId: string,
  userData: UserUpdateRequest,
): Promise<UserResponse> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) return parseError(response, 'Failed to update user');
  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await authedFetch(`${API_BASE}${API_PREFIX}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) return parseError(response, 'Failed to delete user');
}
