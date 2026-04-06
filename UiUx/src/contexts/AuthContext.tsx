import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// * Auth: replace mock userId check with real session-scoped permissions
const mockUsers: Record<Role, User> = {
  [Role.SUPERADMIN]: {
    id: '0',
    email: 'superadmin@workshop.com',
    role: Role.SUPERADMIN,
    name: 'Super Administrator',
    phone: '+60123456790'
  },
  [Role.ADMIN]: {
    id: '1',
    email: 'admin1@workshop.com',
    role: Role.ADMIN,
    name: 'Admin 1',
    phone: '+60123456789'
  },
  [Role.ADMIN2]: {
    id: '2',
    email: 'admin2@workshop.com',
    role: Role.ADMIN2,
    name: 'Admin 2',
    phone: '+60123456785'
  },
  [Role.MANAGEMENT]: {
    id: '3',
    email: 'management@workshop.com',
    role: Role.MANAGEMENT,
    name: 'Manager User',
    phone: '+60123456788'
  },
  [Role.BAY]: {
    id: '4',
    email: 'bay@workshop.com',
    role: Role.BAY,
    name: 'Bay Mechanic',
    phone: '+60123456787'
  },
  [Role.SA]: {
    id: '5',
    email: 'sa@workshop.com',
    role: Role.SA,
    name: 'Service Advisor',
    phone: '+60123456786'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
