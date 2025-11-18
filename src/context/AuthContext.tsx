import { createContext, useContext, useEffect, useState } from "react";
import db from "@/lib/cocobase";

interface AuthContextProps {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  register: (
    name: string,
    email: string,
    password: string,
    extra?: Record<string, any>,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    (async () => {
      try {
        const ok = await db.isAuthenticated();
        if (ok) setUser((db as any).user ?? null);
      } catch (err) {
        console.warn("Auth restore failed", err);
      }
      setLoading(false);
    })();
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    extra?: Record<string, any>,
  ) => {
    try {
      await db.register(email, password, { name, ...(extra || {}) });
      const ok = await db.isAuthenticated();
      if (!ok) throw new Error("Registration failed");
      setUser((db as any).user ?? null);
    } catch (err) {
      console.log("COCOBASE REGISTER ERROR:", err);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await db.login(email, password);
      const ok = await db.isAuthenticated();
      if (!ok) throw new Error("Login failed");
      setUser((db as any).user ?? null);
    } catch (err) {
      console.log("COCOBASE LOGIN ERROR:", err);
      throw err;
    }
  };

  const loginWithGoogle = async (token: string) => {
    await (db as any).auth.loginWithGoogle(token);
    const ok = await db.isAuthenticated();
    if (!ok) throw new Error("Google login failed");
    setUser((db as any).user ?? null);
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
