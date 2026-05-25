"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isOpen: boolean;
  mode: "login" | "register" | "welcome";
}

interface AuthContextValue extends AuthState {
  openModal: (mode?: "login" | "register") => void;
  closeModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
  setWelcomeMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "mai-auth-v1";

const DEMO_CREDENTIALS = {
  email: "demo@mai-procure.com",
  password: "demo123",
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "welcome">("login");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && data.id) {
          setUser(data);
          setIsOpen(true);
          setMode("welcome");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage on user change
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const openModal = useCallback((openMode?: "login" | "register") => {
    setIsOpen(true);
    setMode(openMode ?? "login");
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 1200));

      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        const authUser: AuthUser = {
          id: generateId(),
          name: "Nguyễn Minh Tuấn",
          email: DEMO_CREDENTIALS.email,
          createdAt: new Date().toISOString(),
        };
        setUser(authUser);
        setIsOpen(false);
        return { success: true };
      }

      // Check registered users stored in localStorage
      try {
        const allKeys = Object.keys(localStorage).filter(
          (k) => k.startsWith("mai-user-") && k !== STORAGE_KEY
        );
        for (const key of allKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const storedUser: AuthUser = JSON.parse(stored);
            if (storedUser.email === email.toLowerCase().trim()) {
              setUser(storedUser);
              setIsOpen(false);
              return { success: true };
            }
          }
        }
      } catch {}

      return { success: false, error: "Email hoặc mật khẩu không chính xác." };
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 1500));

      if (!name.trim()) return { success: false, error: "Vui lòng nhập họ tên." };
      if (!email.includes("@")) return { success: false, error: "Email không hợp lệ." };
      if (password.length < 6) return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự." };

      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already registered
      try {
        const allKeys = Object.keys(localStorage).filter(
          (k) => k.startsWith("mai-user-")
        );
        for (const key of allKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const storedUser: AuthUser = JSON.parse(stored);
            if (storedUser.email === normalizedEmail) {
              return { success: false, error: "Email này đã được đăng ký. Vui lòng đăng nhập." };
            }
          }
        }
      } catch {}

      const authUser: AuthUser = {
        id: generateId(),
        name: name.trim(),
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage for login persistence
      try {
        localStorage.setItem(`mai-user-${authUser.id}`, JSON.stringify(authUser));
      } catch {}

      setUser(authUser);
      setIsOpen(false);
      return { success: true };
    },
    []
  );

  const setWelcomeMode = useCallback(() => {
    setMode("welcome");
    setIsOpen(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setMode("login");
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isOpen, mode, openModal, closeModal, login, register, logout, updateUser, setWelcomeMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
