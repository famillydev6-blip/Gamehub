import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: number | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/current");
      const data = await response.json();
      if (data.profileId) {
        setIsAuthenticated(true);
        setProfileId(data.profileId);
      } else {
        setIsAuthenticated(false);
        setProfileId(null);
      }
    } catch {
      setIsAuthenticated(false);
      setProfileId(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setProfileId(null);
    } catch {
      console.error("Logout error");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
