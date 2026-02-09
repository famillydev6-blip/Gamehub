import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: number | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // AUTHENTIFICATION DESACTIVEE TEMPORAIREMENT
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(1);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    // Authentication check disabled
    setIsAuthenticated(true);
    setProfileId(1);
    setLoading(false);
  };

  const logout = async () => {
    // Logout disabled
    console.log("Logout disabled - authentication is deactivated");
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
