import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Get available profiles
  app.get("/api/auth/profiles", async (req, res) => {
    const profiles = await storage.getProfiles();
    res.json(profiles);
  });

  // Login with profile and password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { profileId, password } = z.object({
        profileId: z.number(),
        password: z.string(),
      }).parse(req.body);

      const isValid = await storage.verifyProfile(profileId, password);
      if (!isValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }

      await storage.setCurrentProfileId(profileId);
      res.json({ success: true, profileId });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    await storage.clearProfile();
    res.json({ success: true });
  });

  // Get current profile
  app.get("/api/auth/current", async (req, res) => {
    const currentProfileId = await storage.getCurrentProfileId();
    res.json({ profileId: currentProfileId });
  });

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
