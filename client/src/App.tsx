import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BudgetList from "@/pages/BudgetList";
import BudgetDetail from "@/pages/BudgetDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/budgets" component={BudgetList} />
      <Route path="/budgets/:id" component={BudgetDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
