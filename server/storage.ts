import { 
  budgets, budgetPayments, 
  type Budget, type InsertBudget, type BudgetPayment 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<void>;
  
  getPayments(budgetId: number): Promise<BudgetPayment[]>;
  togglePayment(budgetId: number, monthIndex: number, isPaid: boolean): Promise<BudgetPayment>;
}

export class DatabaseStorage implements IStorage {
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }

  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets).orderBy(budgets.createdAt);
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async deleteBudget(id: number): Promise<void> {
    // Cascade delete payments
    await db.delete(budgetPayments).where(eq(budgetPayments.budgetId, id));
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  async getPayments(budgetId: number): Promise<BudgetPayment[]> {
    return await db.select().from(budgetPayments).where(eq(budgetPayments.budgetId, budgetId));
  }

  async togglePayment(budgetId: number, monthIndex: number, isPaid: boolean): Promise<BudgetPayment> {
    // Check if exists
    const existing = await db.select()
      .from(budgetPayments)
      .where(and(
        eq(budgetPayments.budgetId, budgetId),
        eq(budgetPayments.monthIndex, monthIndex)
      ))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(budgetPayments)
        .set({ isPaid })
        .where(eq(budgetPayments.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(budgetPayments)
        .values({
          budgetId,
          monthIndex,
          isPaid
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
