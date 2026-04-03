export type Expense = {
  id: string;
  occurred_at: string;
  description: string;
  category: string;
  amount_cents: number;
  source: string;
  external_id: string | null;
  created_at: string;
};

export type ExpenseInsert = {
  occurred_at: string;
  description: string;
  category: string;
  amount_cents: number;
  source?: string;
  external_id?: string | null;
};

export type WebhookExpensePayload = {
  occurred_at: string;
  description: string;
  category: string;
  amount_cents: number;
  external_id?: string;
  source?: string;
};
