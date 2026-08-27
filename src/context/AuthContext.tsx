import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import accountsData from '../data/accounts.json';

export interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('crm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('crm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('crm_user');
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    const account = accountsData.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (account) {
      setUser({
        username: account.username,
        name: account.name,
        role: account.role
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
