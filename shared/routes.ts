import { z } from 'zod';
import { insertBudgetSchema, budgets, budgetPayments } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  budgets: {
    list: {
      method: 'GET' as const,
      path: '/api/budgets' as const,
      responses: {
        200: z.array(z.custom<typeof budgets.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/budgets/:id' as const,
      responses: {
        200: z.custom<typeof budgets.$inferSelect & { payments: typeof budgetPayments.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budgets' as const,
      input: insertBudgetSchema,
      responses: {
        201: z.custom<typeof budgets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budgets/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    togglePayment: {
      method: 'POST' as const,
      path: '/api/budgets/:id/payments' as const,
      input: z.object({
        monthIndex: z.number().int().min(0),
        isPaid: z.boolean(),
      }),
      responses: {
        200: z.custom<typeof budgetPayments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
