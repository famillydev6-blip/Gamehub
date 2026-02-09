import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema, type CreateBudgetRequest } from "@shared/schema";
import { useCreateBudget } from "@/hooks/use-budgets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Create a frontend schema that handles strings from inputs and converts to numbers
const formSchema = insertBudgetSchema.extend({
  totalAmount: z.coerce.number().min(1, "Le montant doit être positif"),
  monthlyAmount: z.coerce.number().min(1, "Le budget mensuel doit être positif"),
  // Keep startDate as string YYYY-MM-DD
  startDate: z.string(), 
});

type FormValues = z.infer<typeof formSchema>;

export function CreateBudgetDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const createBudget = useCreateBudget();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      totalAmount: 0,
      monthlyAmount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = (data: FormValues) => {
    createBudget.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  // Watch values for live calculation
  const total = form.watch("totalAmount");
  const monthly = form.watch("monthlyAmount");
  const monthsCount = total && monthly && monthly > 0 ? Math.ceil(total / monthly) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="shadow-lg shadow-primary/20 text-lg font-medium px-8">
            <Plus className="mr-2 h-5 w-5" />
            Créer un tableau
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl">
        <div className="bg-primary/5 p-8 pb-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-primary">Nouveau Budget</DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              Configurez vos paiements échelonnés en quelques clics.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Nom du projet</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Crédit Voiture, Abonnement Gym..." 
                      className="bg-muted/30 border-border/50 focus:bg-background h-11 transition-all"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Montant Total</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="bg-muted/30 border-border/50 focus:bg-background h-11 pl-8 transition-all"
                          {...field} 
                        />
                        <span className="absolute left-3 top-3 text-muted-foreground font-semibold">€</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Mensualité</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="bg-muted/30 border-border/50 focus:bg-background h-11 pl-8 transition-all"
                          {...field} 
                        />
                        <span className="absolute left-3 top-3 text-muted-foreground font-semibold">€</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground/80">Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-11 pl-3 text-left font-normal bg-muted/30 border-border/50 hover:bg-muted/50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live Calculation Card */}
            <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Durée estimée</span>
                  <span className="font-bold text-foreground">
                    {monthsCount > 0 ? `${monthsCount} mois` : "--"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fin estimée</span>
                <div className="font-bold text-foreground">
                  {monthsCount > 0 && form.getValues("startDate")
                    ? format(
                        new Date(new Date(form.getValues("startDate")).setMonth(new Date(form.getValues("startDate")).getMonth() + monthsCount)), 
                        "MMM yyyy", 
                        { locale: fr }
                      )
                    : "--"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                size="lg"
                disabled={createBudget.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all h-12 text-base rounded-xl"
              >
                {createBudget.isPending ? "Création..." : "Créer le tableau"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
