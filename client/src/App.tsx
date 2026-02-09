import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import BudgetList from "@/pages/BudgetList";
import BudgetDetail from "@/pages/BudgetDetail";

function ProtectedRouter() {
  // Authentication check disabled - always show authenticated routes
  return (
    <div>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/budgets" component={BudgetList} />
        <Route path="/budgets/:id" component={BudgetDetail} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ProtectedRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
