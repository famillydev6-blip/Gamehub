import { Link } from "wouter";
import { CreateBudgetDialog } from "@/components/CreateBudgetDialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, WalletCards } from "lucide-react";
import { useBudgets } from "@/hooks/use-budgets";

export default function Home() {
  const { data: budgets, isLoading } = useBudgets();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with abstract pattern background */}
      <div className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        
        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8 max-w-7xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Gestion financière simplifiée
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6">
            Maîtrisez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Échéances</span>
          </h1>
          
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Suivez vos crédits, abonnements et projets personnels en toute simplicité. 
            Visualisez vos progrès et restez à jour sur vos paiements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CreateBudgetDialog />
            
            <Link href="/budgets">
              <Button size="lg" variant="outline" className="text-lg font-medium px-8 border-2 h-[52px] hover:bg-muted/50">
                Voir mes tableaux
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: WalletCards,
              title: "Gestion Centralisée",
              desc: "Tous vos paiements au même endroit. Ne perdez plus jamais le fil de vos remboursements."
            },
            {
              icon: BarChart3,
              title: "Suivi Visuel",
              desc: "Des barres de progression claires pour savoir exactement où vous en êtes dans vos objectifs."
            },
            {
              icon: ShieldCheck,
              title: "Données Sécurisées",
              desc: "Vos informations sont stockées localement et accessibles instantanément."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Footer (Optional) */}
      {!isLoading && budgets && budgets.length > 0 && (
        <div className="border-t bg-card/50 backdrop-blur-sm py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground font-medium mb-2">Vous gérez actuellement</p>
            <p className="text-4xl font-display font-bold text-foreground">{budgets.length} Tableaux Actifs</p>
          </div>
        </div>
      )}
    </div>
  );
}
