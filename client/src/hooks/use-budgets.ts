import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateBudgetRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useBudgets() {
  return useQuery({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      const res = await fetch(api.budgets.list.path);
      if (!res.ok) throw new Error("Impossible de charger les tableaux");
      return api.budgets.list.responses[200].parse(await res.json());
    },
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: [api.budgets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.budgets.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Impossible de charger le tableau");
      return api.budgets.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBudgetRequest) => {
      const validated = api.budgets.create.input.parse(data);
      const res = await fetch(api.budgets.create.path, {
        method: api.budgets.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.budgets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Erreur lors de la création");
      }
      return api.budgets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
      toast({
        title: "Tableau créé",
        description: "Votre nouveau budget a été configuré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.budgets.delete.path, { id });
      const res = await fetch(url, { method: api.budgets.delete.method });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
      toast({
        title: "Tableau supprimé",
        description: "Le budget a été supprimé définitivement.",
      });
    },
  });
}

export function useTogglePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, monthIndex, isPaid }: { id: number; monthIndex: number; isPaid: boolean }) => {
      const url = buildUrl(api.budgets.togglePayment.path, { id });
      const res = await fetch(url, {
        method: api.budgets.togglePayment.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthIndex, isPaid }),
      });
      
      if (!res.ok) throw new Error("Erreur de mise à jour");
      return api.budgets.togglePayment.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.get.path, variables.id] });
    },
  });
}
