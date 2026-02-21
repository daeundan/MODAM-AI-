"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./types";

const STORAGE_KEY = "haircare_user";

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const u = JSON.parse(raw) as User;
        setUser(u);
      }
    } catch {
      setUser(null);
    }
    setIsReady(true);
  }, []);

  const login = (email: string, name: string) => {
    const u: User = {
      id: `user_${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
