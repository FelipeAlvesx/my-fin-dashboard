import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { WebhookExpensePayload } from "@/types/expense";

function isValidPayload(payload: unknown): payload is WebhookExpensePayload {
  if (!payload || typeof payload !== "object") return false;

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.occurred_at === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.amount_cents === "number"
  );
}

export async function POST(req: Request) {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const providedSecret = req.headers.get("x-webhook-secret");

  if (providedSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase env vars not configured" },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      {
        error:
          "Invalid payload. Required fields: occurred_at, description, category, amount_cents",
      },
      { status: 422 }
    );
  }

  const payload = body as WebhookExpensePayload;

  const { data, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      occurred_at: payload.occurred_at,
      description: payload.description,
      category: payload.category,
      amount_cents: payload.amount_cents,
      source: payload.source ?? "ai-agent",
      external_id: payload.external_id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, expense_id: data.id }, { status: 201 });
}
