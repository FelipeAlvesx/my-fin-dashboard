"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Expense } from "@/types/expense";
import {
  formatCurrencyFromCents,
  getAvailableMonths,
  monthLabel,
  normalizeMonthKey,
} from "@/lib/expense-utils";

type DashboardViewProps = {
  initialExpenses: Expense[];
};

const CATEGORY_COLORS = [
  "#7CFFB2",
  "#56F59A",
  "#35DC84",
  "#2EC074",
  "#29A968",
  "#248F58",
];

export function DashboardView({ initialExpenses }: DashboardViewProps) {
  const months = useMemo(
    () => getAvailableMonths(initialExpenses),
    [initialExpenses],
  );
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? "");

  const expenses = useMemo(() => {
    if (!selectedMonth) return [];

    return initialExpenses.filter(
      (expense) => normalizeMonthKey(expense.occurred_at) === selectedMonth,
    );
  }, [initialExpenses, selectedMonth]);

  const totalCents = useMemo(
    () => expenses.reduce((acc, expense) => acc + expense.amount_cents, 0),
    [expenses],
  );

  const averageCents =
    expenses.length > 0 ? Math.round(totalCents / expenses.length) : 0;

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return "-";

    const categories = new Map<string, number>();

    for (const expense of expenses) {
      categories.set(
        expense.category,
        (categories.get(expense.category) ?? 0) + expense.amount_cents,
      );
    }

    return [...categories.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [expenses]);

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of expenses) {
      grouped.set(
        expense.category,
        (grouped.get(expense.category) ?? 0) + expense.amount_cents,
      );
    }

    return [...grouped.entries()].map(([name, amount]) => ({
      name,
      value: Number((amount / 100).toFixed(2)),
    }));
  }, [expenses]);

  const dailyData = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of expenses) {
      const dayLabel = format(parseISO(expense.occurred_at), "dd/MM");
      grouped.set(
        dayLabel,
        (grouped.get(dayLabel) ?? 0) + expense.amount_cents,
      );
    }

    return [...grouped.entries()]
      .map(([day, amount]) => ({
        day,
        amount: Number((amount / 100).toFixed(2)),
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.day.split("/").map(Number);
        const [dayB, monthB] = b.day.split("/").map(Number);
        return monthA === monthB ? dayA - dayB : monthA - monthB;
      });
  }, [expenses]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b09] text-[#edfff4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4cf58f]/15 blur-3xl" />
        <div className="absolute top-[26rem] -left-28 h-80 w-80 rounded-full bg-[#29ba6f]/15 blur-3xl" />
        <div className="absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-[#1f9358]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col px-4 py-6 md:px-8 md:py-10 xl:px-10">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,32,23,0.95),rgba(10,22,16,0.88))] p-6 shadow-[0_30px_80px_-45px_rgba(84,245,151,0.75)] backdrop-blur-2xl transition duration-300 md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(114,255,179,0.2),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(76,245,143,0.15),transparent_35%)]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9ef6c8]">
                Dashboard financeiro
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-[3.1rem] md:leading-[1.05]">
                Seus gastos, do jeito que você precisa ver.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#cefae2]/85 md:text-base">
                Controle total das suas finanças — entradas via webhook,
                tendências mensais e histórico completo num só lugar.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-4 text-left shadow-inner shadow-black/20 backdrop-blur md:max-w-[290px] md:px-5 md:py-4 xl:text-right">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ef2c6]">
                Mês selecionado
              </p>
              <p className="mt-2 text-2xl font-semibold text-white md:text-[1.85rem]">
                {selectedMonth ? monthLabel(selectedMonth) : "Sem dados"}
              </p>
              <p className="mt-1 text-xs text-[#c7f7da]/75">
                Baseado nos lançamentos sincronizados
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#e5ffef]">
                Período de análise
              </h2>
              <p className="text-xs text-[#b8eed0]/80">
                Escolha um mês para atualizar métricas, gráficos e tabela
              </p>
            </div>

            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-2.5 pr-10 text-sm text-white outline-none transition duration-300 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 md:min-w-[240px]"
              >
                {months.length === 0 ? (
                  <option value="">Sem dados</option>
                ) : (
                  months.map((month) => (
                    <option key={month} value={month}>
                      {monthLabel(month)}
                    </option>
                  ))
                )}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a6efc6]">
                ▾
              </span>
            </div>
          </div>
        </section>

        {months.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-[#7ce9af]/35 bg-[#0b1f16]/70 p-6 text-sm text-[#ccf9de]">
            Sem lançamentos ainda. Depois de configurar Supabase + webhook, os
            gastos aparecerão automaticamente aqui.
          </section>
        ) : null}

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total do mês"
            value={formatCurrencyFromCents(totalCents)}
            emphasis
          />
          <MetricCard label="Lançamentos" value={String(expenses.length)} />
          <MetricCard
            label="Ticket médio"
            value={formatCurrencyFromCents(averageCents)}
          />
          <MetricCard label="Categoria líder" value={topCategory} />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-5">
          <ChartCard
            title="Evolução diária de gastos"
            className="xl:col-span-3"
          >
            <ResponsiveContainer width="100%" height={290}>
              <LineChart
                data={dailyData}
                margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#1f4f38" />
                <XAxis
                  dataKey="day"
                  stroke="#bdf7d8"
                  tickLine={false}
                  axisLine={{ stroke: "#1f4f38" }}
                />
                <YAxis
                  stroke="#bdf7d8"
                  tickLine={false}
                  axisLine={{ stroke: "#1f4f38" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0a1d14",
                    border: "1px solid #4dd98c",
                    borderRadius: 14,
                    color: "#ebfff4",
                  }}
                  cursor={{ stroke: "#4de08f", strokeOpacity: 0.25 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Valor (R$)"
                  stroke="#58ec9d"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#b9ffd9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Distribuição por categoria"
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#0a1d14",
                    border: "1px solid #4dd98c",
                    borderRadius: 14,
                    color: "#ebfff4",
                  }}
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl md:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-white">
              Lançamentos do mês
            </h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaf2ca]">
              Webhook + Supabase
            </p>
          </div>

          {expenses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/20 bg-black/10 p-5 text-sm text-[#d0fae2]/80">
              Ainda não há gastos neste mês.
            </p>
          ) : (
            <div className="overflow-auto rounded-2xl border border-white/10 bg-black/10">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-white/[0.03]">
                  <tr className="border-b border-[#2f7f57]/70 text-[#cbf9de]">
                    <th className="py-3 pl-4 pr-4 font-medium">Data</th>
                    <th className="py-3 pr-4 font-medium">Descrição</th>
                    <th className="py-3 pr-4 font-medium">Categoria</th>
                    <th className="py-3 pr-4 font-medium">Origem</th>
                    <th className="py-3 pr-4 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-[#1a4a33]/70 text-[#edfff4] transition duration-200 hover:bg-[#10261b]/70"
                    >
                      <td className="py-3 pl-4 pr-4">
                        {format(parseISO(expense.occurred_at), "dd 'de' MMM", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="py-3 pr-4">{expense.description}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full border border-[#73e9aa]/35 bg-[#0f2a1c] px-2.5 py-1 text-xs text-[#c7fbde]">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#c3f7d8]">
                        {expense.source}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-[#9bf5c5]">
                        {formatCurrencyFromCents(expense.amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function MetricCard({ label, value, emphasis = false }: MetricCardProps) {
  return (
    <article
      className={[
        "group rounded-3xl border p-4 backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-0.5 md:p-5",
        emphasis
          ? "border-[#4de08f]/30 bg-[linear-gradient(135deg,rgba(14,36,24,0.95),rgba(10,24,17,0.88))] shadow-[0_8px_40px_-12px_rgba(77,224,143,0.35)]"
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#a4f0c8]">
        {label}
      </p>
      <p
        className={[
          "mt-2 text-2xl font-semibold md:text-[1.75rem]",
          emphasis ? "text-[#7cffb2]" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </article>
  );
}

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl md:p-5",
        className,
      ].join(" ")}
    >
      <h2 className="mb-4 text-sm font-medium text-[#e5ffef]">{title}</h2>
      {children}
    </div>
  );
}
