import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalAmount: integer("total_amount").notNull(), // Stored in cents/units
  monthlyAmount: integer("monthly_amount").notNull(), // Stored in cents/units
  startDate: text("start_date").notNull(), // ISO Date string YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetPayments = pgTable("budget_payments", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  monthIndex: integer("month_index").notNull(), // 0 for 1st month, 1 for 2nd, etc.
  isPaid: boolean("is_paid").default(false).notNull(),
});

// === RELATIONS ===

export const budgetsRelations = relations(budgets, ({ many }) => ({
  payments: many(budgetPayments),
}));

export const budgetPaymentsRelations = relations(budgetPayments, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetPayments.budgetId],
    references: [budgets.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true });
export const insertBudgetPaymentSchema = createInsertSchema(budgetPayments).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type BudgetPayment = typeof budgetPayments.$inferSelect;

// Request types
export type CreateBudgetRequest = InsertBudget;
export type TogglePaymentRequest = { monthIndex: number; isPaid: boolean };

// Response types
// We will return the budget with an array of paid month indices usually, 
// or let the frontend fetch payments separately. 
// For simplicity, the get budget endpoint can return budget + payments.
export type BudgetWithPayments = Budget & { payments: BudgetPayment[] };

export type CreateBudgetResponse = Budget;
export type BudgetListResponse = Budget[];

