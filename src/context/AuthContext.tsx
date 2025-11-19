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

  const buildUserWithWorkspace = async () => {
    const rawUser = (db as any).user ?? null;
    if (!rawUser) return null;

    const authUserId = (rawUser as any).id;
    const email = (rawUser as any).email as string | undefined;

    try {
      let memberDocs: any[] = [];

      // Prefer matching by authUserId if present
      if (authUserId) {
        try {
          memberDocs = await db.listDocuments("members", {
            filters: { authUserId },
            sort: "created_at",
            order: "desc",
          });
        } catch (err) {
          console.warn("AUTH WORKSPACE LOOKUP BY AUTH USER ID FAILED", err);
        }
      }

      // Fallback: match by email
      if ((!memberDocs || memberDocs.length === 0) && email) {
        try {
          memberDocs = await db.listDocuments("members", {
            filters: { email },
            sort: "created_at",
            order: "desc",
          });
        } catch (err) {
          console.warn("AUTH WORKSPACE LOOKUP BY EMAIL FAILED", err);
        }
      }

      if (!memberDocs || memberDocs.length === 0) {
        // No member record yet – treat this user as the owner of their own workspace
        return {
          ...rawUser,
          workspaceId: authUserId,
          role: (rawUser as any).role ?? "Admin",
        };
      }

      const member = memberDocs[0];
      const data = (member as any).data || {};
      const workspaceId = data.ownerId || authUserId;
      const role = data.role || (rawUser as any).role || "Member";

      return {
        ...rawUser,
        workspaceId,
        role,
      };
    } catch (err) {
      console.warn("AUTH WORKSPACE ENRICH ERROR", err);
      return rawUser;
    }
  };

  // Restore session
  useEffect(() => {
    (async () => {
      try {
        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem("hf_auth_user")
            : null;

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setLoading(false);
            return;
          } catch {
            // ignore parse errors and fall through to live check
          }
        }

        const ok = await db.isAuthenticated();
        if (ok) {
          const enriched = await buildUserWithWorkspace();
          setUser(enriched);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("hf_auth_user", JSON.stringify(enriched));
          }
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("hf_auth_user");
          }
        }
      } catch (err) {
        console.warn("Auth restore failed", err);
        setUser(null);
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
      let ok = await db.isAuthenticated();

      // Some Cocobase setups may not auto-login after register; try an explicit login
      if (!ok) {
        try {
          await db.login(email, password);
          ok = await db.isAuthenticated();
        } catch (err) {
          console.log("COCOBASE REGISTER LOGIN ERROR:", err);
        }
      }

      if (!ok) {
        throw new Error("Registration succeeded but login failed");
      }
      const enriched = await buildUserWithWorkspace();
      setUser(enriched);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hf_auth_user", JSON.stringify(enriched));
      }
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
      const enriched = await buildUserWithWorkspace();
      setUser(enriched);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hf_auth_user", JSON.stringify(enriched));
      }
    } catch (err) {
      console.log("COCOBASE LOGIN ERROR:", err);
      throw err;
    }
  };

  const loginWithGoogle = async (token: string) => {
    await (db as any).auth.loginWithGoogle(token);
    const ok = await db.isAuthenticated();
    if (!ok) throw new Error("Google login failed");
    const enriched = await buildUserWithWorkspace();
    setUser(enriched);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hf_auth_user", JSON.stringify(enriched));
    }
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("hf_auth_user");
    }
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
