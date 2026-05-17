import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  booting: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, role: UserRole): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gigflow_token");
    if (!token) {
      setBooting(false);
      return;
    }

    api
      .me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem("gigflow_token"))
      .finally(() => setBooting(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      booting,
      async login(email, password) {
        const { token, user: authUser } = await api.login({ email, password });
        localStorage.setItem("gigflow_token", token);
        setUser(authUser);
      },
      async register(name, email, password, role) {
        const { token, user: authUser } = await api.register({ name, email, password, role });
        localStorage.setItem("gigflow_token", token);
        setUser(authUser);
      },
      logout() {
        localStorage.removeItem("gigflow_token");
        setUser(null);
      }
    }),
    [booting, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
