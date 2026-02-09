import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // List budgets
  app.get(api.budgets.list.path, async (req, res) => {
    const budgets = await storage.getBudgets();
    res.json(budgets);
  });

  // Get budget details
  app.get(api.budgets.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const budget = await storage.getBudget(id);
    if (!budget) {
      return res.status(404).json({ message: 'Tableau non trouvé' });
    }
    const payments = await storage.getPayments(id);
    res.json({ ...budget, payments });
  });

  // Create budget
  app.post(api.budgets.create.path, async (req, res) => {
    try {
      const input = api.budgets.create.input.parse(req.body);
      const budget = await storage.createBudget(input);
      res.status(201).json(budget);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Delete budget
  app.delete(api.budgets.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const budget = await storage.getBudget(id);
    if (!budget) {
      return res.status(404).json({ message: 'Tableau non trouvé' });
    }
    await storage.deleteBudget(id);
    res.status(204).send();
  });

  // Toggle payment
  app.post(api.budgets.togglePayment.path, async (req, res) => {
    const id = Number(req.params.id);
    const budget = await storage.getBudget(id);
    if (!budget) {
      return res.status(404).json({ message: 'Tableau non trouvé' });
    }

    try {
      const { monthIndex, isPaid } = api.budgets.togglePayment.input.parse(req.body);
      const payment = await storage.togglePayment(id, monthIndex, isPaid);
      res.json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
