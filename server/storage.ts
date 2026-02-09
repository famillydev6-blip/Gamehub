import fs from "fs/promises";
import path from "path";
import type { Budget, InsertBudget, BudgetPayment } from "@shared/schema";

export interface IStorage {
  // Profile methods
  getProfiles(): Promise<{ id: number; name: string }[]>;
  verifyProfile(profileId: number, password: string): Promise<boolean>;
  getCurrentProfileId(): Promise<number | null>;
  setCurrentProfileId(profileId: number): Promise<void>;
  clearProfile(): Promise<void>;
  
  // Budget methods
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<void>;
  
  // Payment methods
  getPayments(budgetId: number): Promise<BudgetPayment[]>;
  togglePayment(budgetId: number, monthIndex: number, isPaid: boolean): Promise<BudgetPayment>;
}

interface Profile {
  id: number;
  name: string;
  password: string;
}

interface DataStore {
  profiles: Profile[];
  currentProfileId: number | null;
  budgets: Budget[];
  budgetPayments: BudgetPayment[];
  nextBudgetId: number;
  nextPaymentId: number;
}

export class JSONStorage implements IStorage {
  private dataPath: string;
  private data: DataStore | null = null;

  constructor() {
    this.dataPath = path.join(process.cwd(), "server", "data.json");
  }

  private async loadData(): Promise<DataStore> {
    if (this.data) return this.data;
    
    try {
      const content = await fs.readFile(this.dataPath, "utf-8");
      this.data = JSON.parse(content);
    } catch {
      this.data = {
        profiles: [],
        currentProfileId: null,
        budgets: [],
        budgetPayments: [],
        nextBudgetId: 1,
        nextPaymentId: 1,
      };
      await this.saveData();
    }
    return this.data;
  }

  private async saveData(): Promise<void> {
    if (!this.data) return;
    await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  // Profile methods
  async getProfiles(): Promise<{ id: number; name: string }[]> {
    const data = await this.loadData();
    return data.profiles.map(p => ({ id: p.id, name: p.name }));
  }

  async verifyProfile(profileId: number, password: string): Promise<boolean> {
    const data = await this.loadData();
    const profile = data.profiles.find(p => p.id === profileId);
    if (!profile) return false;
    return profile.password === password;
  }

  async getCurrentProfileId(): Promise<number | null> {
    const data = await this.loadData();
    return data.currentProfileId;
  }

  async setCurrentProfileId(profileId: number): Promise<void> {
    const data = await this.loadData();
    data.currentProfileId = profileId;
    await this.saveData();
  }

  async clearProfile(): Promise<void> {
    const data = await this.loadData();
    data.currentProfileId = null;
    await this.saveData();
  }

  // Budget methods
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const data = await this.loadData();
    const budget: Budget = {
      id: data.nextBudgetId++,
      ...insertBudget,
      createdAt: new Date(),
    };
    data.budgets.push(budget);
    await this.saveData();
    return budget;
  }

  async getBudgets(): Promise<Budget[]> {
    const data = await this.loadData();
    return data.budgets.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const data = await this.loadData();
    return data.budgets.find(b => b.id === id);
  }

  async deleteBudget(id: number): Promise<void> {
    const data = await this.loadData();
    data.budgets = data.budgets.filter(b => b.id !== id);
    data.budgetPayments = data.budgetPayments.filter(p => p.budgetId !== id);
    await this.saveData();
  }

  async getPayments(budgetId: number): Promise<BudgetPayment[]> {
    const data = await this.loadData();
    return data.budgetPayments.filter(p => p.budgetId === budgetId);
  }

  async togglePayment(budgetId: number, monthIndex: number, isPaid: boolean): Promise<BudgetPayment> {
    const data = await this.loadData();
    const existing = data.budgetPayments.find(
      p => p.budgetId === budgetId && p.monthIndex === monthIndex
    );

    if (existing) {
      existing.isPaid = isPaid;
    } else {
      const payment: BudgetPayment = {
        id: data.nextPaymentId++,
        budgetId,
        monthIndex,
        isPaid,
      };
      data.budgetPayments.push(payment);
    }
    
    await this.saveData();
    return data.budgetPayments.find(
      p => p.budgetId === budgetId && p.monthIndex === monthIndex
    )!;
  }
}

export const storage = new JSONStorage();
