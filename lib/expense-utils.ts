import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense } from "@/types/expense";

export function formatCurrencyFromCents(amountCents: number): string {
  return (amountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function normalizeMonthKey(isoDate: string): string {
  return format(parseISO(isoDate), "yyyy-MM");
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function getAvailableMonths(expenses: Expense[]): string[] {
  const set = new Set(expenses.map((expense) => normalizeMonthKey(expense.occurred_at)));

  return [...set].sort((a, b) => b.localeCompare(a));
}
