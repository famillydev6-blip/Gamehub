import { Link } from "wouter";
import { type Budget } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CalendarDays, Wallet } from "lucide-react";

interface BudgetCardProps {
  budget: Budget;
  paymentsCount: number; // passed from parent logic
}

export function BudgetCard({ budget, paymentsCount }: BudgetCardProps) {
  const totalMonths = Math.ceil(budget.totalAmount / budget.monthlyAmount);
  const paidAmount = paymentsCount * budget.monthlyAmount;
  const progress = Math.min((paidAmount / budget.totalAmount) * 100, 100);

  return (
    <Link href={`/budgets/${budget.id}`}>
      <div className="group cursor-pointer">
        <Card className="h-full border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 rounded-2xl bg-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  {budget.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                  <span>Démarré le {new Date(budget.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Reste à payer</p>
                  <p className="text-2xl font-bold font-display tracking-tight text-foreground">
                    {(budget.totalAmount - paidAmount).toLocaleString('fr-FR')} €
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-semibold text-primary">
                     {Math.round(progress)}%
                   </p>
                </div>
              </div>

              <Progress value={progress} className="h-2.5 bg-secondary" indicatorClassName="bg-primary group-hover:bg-primary/90" />
              
              <div className="flex justify-between text-xs font-medium text-muted-foreground pt-2">
                <span>{paymentsCount} / {totalMonths} mois</span>
                <span className="flex items-center text-primary group-hover:underline">
                  Voir détails <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
