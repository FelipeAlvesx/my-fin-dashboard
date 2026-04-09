"use client";

import { useEffect, useRef, useState } from "react";
import { CANONICAL_CATEGORIES } from "@/lib/category-normalizer";
import type { Expense } from "@/types/expense";

export type ExpenseModalMode =
  | { type: "create" }
  | { type: "edit"; expense: Expense };

type ExpenseModalProps = {
  mode: ExpenseModalMode;
  onClose: () => void;
  onSuccess: (expense: Expense) => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseModal({ mode, onClose, onSuccess }: ExpenseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isEdit = mode.type === "edit";
  const initial = isEdit ? mode.expense : null;

  const [category, setCategory] = useState(
    initial?.category ?? CANONICAL_CATEGORIES[0],
  );
  const [amountStr, setAmountStr] = useState(
    initial ? (initial.amount_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [date, setDate] = useState(
    initial ? initial.occurred_at.slice(0, 10) : todayIso(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abre o dialog ao montar e fecha ao pressionar Escape (nativo)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  // Fecha ao clicar no backdrop (fora do conteúdo do dialog)
  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = event;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      dialogRef.current?.close();
    }
  }

  function parseAmountCents(raw: string): number | null {
    // aceita "45,00" ou "45.00" ou "45"
    const normalized = raw.replace(",", ".");
    const float = parseFloat(normalized);
    if (isNaN(float) || float <= 0) return null;
    return Math.round(float * 100);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const amount_cents = parseAmountCents(amountStr);

    if (!amount_cents) {
      setError("Informe um valor válido (ex: 45,90)");
      return;
    }

    const body = {
      category,
      amount_cents,
      occurred_at: new Date(date + "T12:00:00").toISOString(),
    };

    setLoading(true);

    try {
      const url = isEdit ? `/api/expenses/${initial!.id}` : "/api/expenses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erro ao salvar");
        return;
      }

      onSuccess(json.expense as Expense);
      dialogRef.current?.close();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      className="m-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#060e09] p-0 text-[#edfff4] shadow-[0_30px_80px_-20px_rgba(84,245,151,0.35)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-white"
          >
            {isEdit ? "Editar lançamento" : "Novo lançamento"}
          </h2>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={() => dialogRef.current?.close()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#a4f0c8] transition hover:border-white/30 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modal-category"
              className="text-xs font-medium uppercase tracking-widest text-[#9ef6c8]"
            >
              Categoria
            </label>
            <div className="relative">
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25"
              >
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a6efc6]">
                ▾
              </span>
            </div>
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modal-amount"
              className="text-xs font-medium uppercase tracking-widest text-[#9ef6c8]"
            >
              Valor (R$)
            </label>
            <input
              id="modal-amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              autoFocus={!isEdit}
              className="rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white outline-none placeholder:text-[#4a8c68] transition focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25"
            />
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modal-date"
              className="text-xs font-medium uppercase tracking-widest text-[#9ef6c8]"
            >
              Data
            </label>
            <input
              id="modal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 [color-scheme:dark]"
            />
          </div>

          {/* Erro */}
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {/* Ações */}
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-[#cefae2] transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#2dbb72] py-3 text-sm font-semibold text-[#051209] transition hover:bg-[#35d882] disabled:opacity-60"
            >
              {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
