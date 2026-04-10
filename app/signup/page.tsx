"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "@/app/actions/auth";

const initialState: SignupState = { error: null };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b09]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4cf58f]/15 blur-3xl" />
          <div className="absolute top-[26rem] -left-28 h-80 w-80 rounded-full bg-[#29ba6f]/15 blur-3xl" />
          <div className="absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-[#1f9358]/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm px-4 text-center">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,32,23,0.95),rgba(10,22,16,0.88))] p-8 shadow-[0_30px_80px_-45px_rgba(84,245,151,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(114,255,179,0.15),transparent_50%),radial-gradient(circle_at_85%_10%,rgba(76,245,143,0.1),transparent_40%)]" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4de08f]/30 bg-[#0a1f15]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-[#7cffb2]">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white">Conta criada!</h1>
              <p className="mt-2 text-sm text-[#cefae2]/70">
                Verifique seu e-mail para confirmar o cadastro antes de entrar.
              </p>
              <Link
                href="/login"
                className="mt-6 block w-full rounded-2xl border border-[#4de08f]/40 bg-[linear-gradient(135deg,rgba(14,40,26,0.95),rgba(10,28,18,0.9))] px-4 py-3 text-sm font-semibold text-[#9ef6c8] shadow-[0_8px_32px_-8px_rgba(77,224,143,0.4)] transition duration-200 hover:border-[#4de08f]/70 hover:text-white hover:shadow-[0_12px_40px_-8px_rgba(77,224,143,0.55)]"
              >
                Ir para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b09]">
      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4cf58f]/15 blur-3xl" />
        <div className="absolute top-[26rem] -left-28 h-80 w-80 rounded-full bg-[#29ba6f]/15 blur-3xl" />
        <div className="absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-[#1f9358]/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-4">
        {/* Card */}
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,32,23,0.95),rgba(10,22,16,0.88))] p-8 shadow-[0_30px_80px_-45px_rgba(84,245,151,0.55)] backdrop-blur-2xl">
          {/* Gradiente interno */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(114,255,179,0.15),transparent_50%),radial-gradient(circle_at_85%_10%,rgba(76,245,143,0.1),transparent_40%)]" />

          <div className="relative">
            {/* Logo / título */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9ef6c8]">
              Dashboard financeiro
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Criar conta
            </h1>
            <p className="mt-1 text-sm text-[#cefae2]/70">
              Acesse seus dados com segurança.
            </p>

            {/* Formulário */}
            <form action={formAction} className="mt-8 flex flex-col gap-5">
              {/* E-mail */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
                />
              </div>

              {/* Senha */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
                />
              </div>

              {/* Confirmar Senha */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]"
                >
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
                />
              </div>

              {/* Mensagem de erro */}
              {state.error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm text-red-300"
                >
                  {state.error}
                </p>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={isPending}
                className="mt-1 w-full rounded-2xl border border-[#4de08f]/40 bg-[linear-gradient(135deg,rgba(14,40,26,0.95),rgba(10,28,18,0.9))] px-4 py-3 text-sm font-semibold text-[#9ef6c8] shadow-[0_8px_32px_-8px_rgba(77,224,143,0.4)] transition duration-200 hover:border-[#4de08f]/70 hover:text-white hover:shadow-[0_12px_40px_-8px_rgba(77,224,143,0.55)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Criando conta…" : "Criar conta"}
              </button>
            </form>

            {/* Link para login */}
            <p className="mt-5 text-center text-xs text-[#9ef2c6]/60">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-medium text-[#9ef6c8] underline-offset-4 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
