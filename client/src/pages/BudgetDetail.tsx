import { Link, useRoute } from "wouter";
import { useBudget, useDeleteBudget, useTogglePayment } from "@/hooks/use-budgets";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Trash2, Calendar, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function BudgetDetail() {
  const [, params] = useRoute("/budgets/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();
  
  const { data: budgetData, isLoading, error } = useBudget(id);
  const deleteBudget = useDeleteBudget();
  const togglePayment = useTogglePayment();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-48 w-full rounded-3xl mb-12" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !budgetData) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Erreur de chargement</h2>
        <Link href="/budgets">
          <Button variant="outline">Retourner à la liste</Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const budget = budgetData; // This includes payments array due to schema
  // Note: The API type says payments: BudgetPayment[]
  const payments = budgetData.payments || [];
  
  const totalMonths = Math.ceil(budget.totalAmount / budget.monthlyAmount);
  const paidMonthsCount = payments.filter(p => p.isPaid).length;
  const paidAmount = paidMonthsCount * budget.monthlyAmount;
  const remainingAmount = Math.max(0, budget.totalAmount - paidAmount);
  const progress = Math.min((paidAmount / budget.totalAmount) * 100, 100);

  const handleDelete = () => {
    deleteBudget.mutate(id, {
      onSuccess: () => setLocation("/budgets"),
    });
  };

  const handleToggleMonth = (index: number, currentStatus: boolean) => {
    togglePayment.mutate({
      id,
      monthIndex: index,
      isPaid: !currentStatus,
    });
  };

  // Generate month list
  const startDate = new Date(budget.startDate);
  const months = Array.from({ length: totalMonths }, (_, i) => {
    const date = addMonths(startDate, i);
    const isPaid = payments.some(p => p.monthIndex === i && p.isPaid);
    return { index: i, date, isPaid };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card border-b">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/budgets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le tableau "{budget.name}" et tout son historique seront effacés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-2">{budget.name}</h1>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Démarré le {format(new Date(budget.startDate), "d MMMM yyyy", { locale: fr })}
              </div>
            </div>
            <div className="text-left md:text-right bg-primary/5 px-6 py-4 rounded-2xl border border-primary/10">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Budget</p>
              <p className="text-3xl font-bold font-display text-primary">{budget.totalAmount.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-12">
        {/* Main Stats Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-border/60 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Progression du remboursement</h3>
                    <p className="text-muted-foreground text-sm">
                      {paidMonthsCount} sur {totalMonths} mensualités réglées
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                
                <Progress value={progress} className="h-4 bg-secondary rounded-full" indicatorClassName="bg-primary transition-all duration-500" />
                
                <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Déjà payé</p>
                    <p className="text-2xl font-bold text-emerald-600">{paidAmount.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Restant</p>
                    <p className="text-2xl font-bold text-foreground">{remainingAmount.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-foreground px-2">Échéancier</h3>
              <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                {months.map((month, idx) => (
                  <div 
                    key={month.index}
                    className={cn(
                      "flex items-center justify-between p-4 px-6 border-b last:border-0 transition-colors hover:bg-muted/30 cursor-pointer",
                      month.isPaid ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""
                    )}
                    onClick={() => handleToggleMonth(month.index, month.isPaid)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                        month.isPaid 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200 shadow-md" 
                          : "bg-background border-border text-muted-foreground"
                      )}>
                        {month.isPaid ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-semibold">{month.index + 1}</span>}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium transition-all",
                          month.isPaid ? "text-emerald-700 dark:text-emerald-400 line-through decoration-2 decoration-emerald-500/30" : "text-foreground"
                        )}>
                          {format(month.date, "MMMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mensualité: {budget.monthlyAmount} €
                        </p>
                      </div>
                    </div>
                    
                    <Checkbox 
                      checked={month.isPaid} 
                      onCheckedChange={() => handleToggleMonth(month.index, month.isPaid)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-all data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
                        month.isPaid ? "" : "border-muted-foreground/30"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 rounded-3xl">
              <CardContent className="p-8">
                <Wallet className="w-12 h-12 mb-6 opacity-80" />
                <h3 className="text-lg font-semibold opacity-90 mb-2">Mensualité Fixe</h3>
                <p className="text-4xl font-display font-bold tracking-tight">{budget.monthlyAmount} €</p>
                <p className="text-sm opacity-70 mt-4 pt-4 border-t border-white/20">
                  Prélevé chaque mois
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="p-8">
                <h3 className="font-semibold text-foreground mb-4">Infos Clés</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Durée Totale</span>
                    <span className="font-medium">{totalMonths} mois</span>
                  </li>
                  <li className="flex justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Date de fin estimée</span>
                    <span className="font-medium">
                      {format(addMonths(startDate, totalMonths), "MMM yyyy", { locale: fr })}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">État</span>
                    <span className={cn(
                      "font-medium px-2 py-0.5 rounded-full text-xs",
                      progress === 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {progress === 100 ? "Terminé" : "En cours"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
