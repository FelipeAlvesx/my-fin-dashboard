import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { DashboardView } from "@/components/dashboard-view";
import type { Expense } from "@/types/expense";

export const dynamic = "force-dynamic";

async function getExpenses(): Promise<Expense[]> {
  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select("id, occurred_at, description, category, amount_cents, source, external_id, created_at")
    .order("occurred_at", { ascending: false });

  if (error) {
    console.error("Error loading expenses:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function Home() {
  const expenses = await getExpenses();

  return <DashboardView initialExpenses={expenses} />;
}
