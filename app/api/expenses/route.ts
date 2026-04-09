import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { normalizeCategory } from "@/lib/category-normalizer";

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase env vars not configured" },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.category !== "string" ||
    typeof candidate.amount_cents !== "number" ||
    candidate.amount_cents <= 0
  ) {
    return NextResponse.json(
      { error: "Required: category (string), amount_cents (number > 0)" },
      { status: 422 },
    );
  }

  const normalizedCategory = normalizeCategory(candidate.category);
  const occurredAt =
    typeof candidate.occurred_at === "string"
      ? candidate.occurred_at
      : new Date().toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      occurred_at: occurredAt,
      description: normalizedCategory,
      category: normalizedCategory,
      amount_cents: candidate.amount_cents,
      source: "manual",
      external_id: null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, expense: data }, { status: 201 });
}
