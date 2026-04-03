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

const CATEGORY_COLORS = ["#3bd47f", "#21c76e", "#20b966", "#17a95c", "#13924f", "#0f7842"];

export function DashboardView({ initialExpenses }: DashboardViewProps) {
  const months = useMemo(() => getAvailableMonths(initialExpenses), [initialExpenses]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? "");

  const expenses = useMemo(() => {
    if (!selectedMonth) return [];

    return initialExpenses.filter(
      (expense) => normalizeMonthKey(expense.occurred_at) === selectedMonth
    );
  }, [initialExpenses, selectedMonth]);

  const totalCents = useMemo(
    () => expenses.reduce((acc, expense) => acc + expense.amount_cents, 0),
    [expenses]
  );

  const averageCents = expenses.length > 0 ? Math.round(totalCents / expenses.length) : 0;

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return "-";

    const categories = new Map<string, number>();

    for (const expense of expenses) {
      categories.set(expense.category, (categories.get(expense.category) ?? 0) + expense.amount_cents);
    }

    return [...categories.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [expenses]);

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of expenses) {
      grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + expense.amount_cents);
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
      grouped.set(dayLabel, (grouped.get(dayLabel) ?? 0) + expense.amount_cents);
    }

    return [...grouped.entries()]
      .map(([day, amount]) => ({ day, amount: Number((amount / 100).toFixed(2)) }))
      .sort((a, b) => {
        const [dayA, monthA] = a.day.split("/").map(Number);
        const [dayB, monthB] = b.day.split("/").map(Number);
        return monthA === monthB ? dayA - dayB : monthA - monthB;
      });
  }, [expenses]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030f08] text-[#ecfff4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#35d47d]/20 blur-3xl" />
        <div className="absolute top-[28rem] -left-20 h-72 w-72 rounded-full bg-[#1a8f55]/25 blur-3xl" />
        <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-[#0f6b3b]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 py-8 md:px-8 md:py-12">
        <header className="rounded-[2rem] border border-[#5fe199]/30 bg-gradient-to-br from-[#0f2f1e]/80 via-[#0a2618]/75 to-[#081d13]/70 p-6 shadow-[0_24px_70px_-30px_rgba(59,212,127,0.6)] backdrop-blur-xl transition duration-300 ease-out hover:border-[#7aeaad]/45 md:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9df4c5]">
                Controle financeiro pessoal
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl md:leading-tight">
                Seu mês financeiro em um painel inteligente.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#c9f9df]/85 md:text-base">
                Monitore gastos recebidos por webhook, acompanhe variações diárias e identifique padrões
                de consumo com uma experiência visual premium e objetiva.
              </p>
            </div>

            <div className="rounded-2xl border border-[#69e7a2]/25 bg-[#0a2116]/70 px-4 py-3 text-right transition duration-300 hover:bg-[#0d281b]/80">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9becc0]">Mês selecionado</p>
              <p className="mt-1 text-xl font-semibold text-white md:text-2xl">
                {selectedMonth ? monthLabel(selectedMonth) : "Sem dados"}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#d9ffea]">Sessão de meses</h2>
              <p className="text-xs text-[#baf3d1]/80">Selecione o mês para atualizar métricas e gráficos</p>
            </div>

            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-2xl border border-[#69e7a2]/30 bg-[#0a2317] px-4 py-2.5 text-sm text-white outline-none transition duration-300 focus:border-[#7ff0b1]"
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
          </div>
        </section>

        {months.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-[#7ce9af]/35 bg-[#091f15]/60 p-6 text-sm text-[#c8f8dc]">
            Sem lançamentos ainda. Depois de configurar Supabase + webhook, os gastos aparecerão automaticamente aqui.
          </section>
        ) : null}

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total do mês" value={formatCurrencyFromCents(totalCents)} emphasis />
          <MetricCard label="Lançamentos" value={String(expenses.length)} />
          <MetricCard label="Ticket médio" value={formatCurrencyFromCents(averageCents)} />
          <MetricCard label="Categoria líder" value={topCategory} />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
          <ChartCard title="Evolução diária de gastos" className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#194730" />
                <XAxis dataKey="day" stroke="#bdf7d8" tickLine={false} axisLine={{ stroke: "#194730" }} />
                <YAxis stroke="#bdf7d8" tickLine={false} axisLine={{ stroke: "#194730" }} />
                <Tooltip
                  contentStyle={{
                    background: "#0b2015",
                    border: "1px solid #47c981",
                    borderRadius: 14,
                    color: "#e8fff2",
                  }}
                  cursor={{ stroke: "#3bd47f", strokeOpacity: 0.25 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Valor (R$)"
                  stroke="#49d786"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#a8ffce" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribuição por categoria" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#0b2015",
                    border: "1px solid #47c981",
                    borderRadius: 14,
                    color: "#e8fff2",
                  }}
                />
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Lançamentos do mês</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-[#aaf2ca]">Webhook + Supabase</p>
          </div>

          {expenses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/20 bg-black/10 p-5 text-sm text-[#d0fae2]/80">
              Ainda não há gastos neste mês.
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2f7f57] text-[#c8f8dc]">
                    <th className="py-2.5 pr-4 font-medium">Data</th>
                    <th className="py-2.5 pr-4 font-medium">Descrição</th>
                    <th className="py-2.5 pr-4 font-medium">Categoria</th>
                    <th className="py-2.5 pr-4 font-medium">Origem</th>
                    <th className="py-2.5 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-[#1b4f35]/70 text-[#e8fff2] transition duration-200 hover:bg-[#0d2a1b]/60"
                    >
                      <td className="py-3 pr-4">
                        {format(parseISO(expense.occurred_at), "dd 'de' MMM", { locale: ptBR })}
                      </td>
                      <td className="py-3 pr-4">{expense.description}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full border border-[#69e7a2]/35 bg-[#0b2a1b] px-2.5 py-1 text-xs text-[#bff8d8]">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#c1f5d7]">{expense.source}</td>
                      <td className="py-3 text-right font-semibold text-[#93f3bf]">
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
        "rounded-3xl border p-4 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-0.5",
        emphasis
          ? "border-[#6ae9a5]/40 bg-gradient-to-br from-[#123925] to-[#0b2418] shadow-[0_20px_50px_-30px_rgba(106,233,165,0.9)]"
          : "border-white/10 bg-white/[0.04] hover:border-[#59d591]/30",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#b8f6d4]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white md:text-[1.9rem]">{value}</p>
    </article>
  );
}

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <article
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition duration-300 hover:border-[#59d591]/30 md:p-5 ${className}`}
    >
      <h3 className="mb-3 text-base font-medium text-[#d6ffea]">{title}</h3>
      {children}
    </article>
  );
}
