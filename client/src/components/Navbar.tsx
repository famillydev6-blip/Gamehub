import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { Link } from "wouter";

export function Navbar() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8 max-w-7xl flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg">
              <span className="text-primary">💰</span>
            </div>
            Budget Manager
          </a>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
