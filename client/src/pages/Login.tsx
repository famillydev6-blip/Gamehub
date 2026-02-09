import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogIn } from "lucide-react";

interface Profile {
  id: number;
  name: string;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/auth/profiles");
      const data = await response.json();
      setProfiles(data);
      if (data.length > 0) {
        setSelectedProfileId(String(data[0].id));
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfileId || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un profil et entrer le mot de passe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: Number(selectedProfileId),
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.message || "Mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      const profile = profiles.find(p => p.id === Number(selectedProfileId));
      toast({
        title: "Bienvenue",
        description: `Connecté au profil: ${profile?.name}`,
      });

      // Refresh auth state then redirect to home
      await checkAuth();
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  if (loadingProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Budget Manager Pro</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous avec votre profil
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile" className="text-sm font-medium">
                Sélectionner un profil
              </label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger id="profile" className="w-full">
                  <SelectValue placeholder="Choisir un profil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={String(profile.id)}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === "Enter" && handleLogin(e as any)}
                className="focus-visible:ring-primary"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full gap-2"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Connexion..." : "Connexion"}
            </Button>
          </form>

          {/* Profiles and passwords are private — not displayed in UI */}
        </CardContent>
      </Card>
    </div>
  );
}
