/**
 * Auth API Client - All authentication-related API calls
 */

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

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(token: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to get user');
  }

  return response.json();
}

/**
 * Logout (invalidate current token)
 */
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Logout failed');
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(token: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Token refresh failed');
  }

  return response.json();
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to request password reset');
  }

  return response.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to reset password');
  }

  return response.json();
}

/**
 * List all users (requires SUPER_ADMIN)
 */
export async function listUsers(
  token: string,
  filters?: { role?: string; is_active?: boolean }
): Promise<UserResponse[]> {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

  const url = `${API_BASE}${API_PREFIX}/users/${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to fetch users');
  }

  return response.json();
}

/**
 * Create a new user (requires SUPER_ADMIN)
 */
export async function createUser(
  token: string,
  userData: UserCreateRequest
): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/users/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to create user');
  }

  return response.json();
}

/**
 * Update a user (requires SUPER_ADMIN)
 */
export async function updateUser(
  token: string,
  userId: string,
  userData: UserUpdateRequest
): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to update user');
  }

  return response.json();
}

/**
 * Delete a user (soft delete - deactivates user, requires SUPER_ADMIN)
 */
export async function deleteUser(token: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to delete user');
  }
}
