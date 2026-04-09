"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// O Supabase JS v2 usa este padrão de nome para o cookie de sessão
const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL!.split(
  ".",
)[0].replace("https://", "");

function getCookieName() {
  return `sb-${SUPABASE_PROJECT_REF}-auth-token`;
}

function getEnvOrThrow() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

// ─── Server Action: login ─────────────────────────────────────────────────────

export type LoginState = {
  error: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvOrThrow();
  const cookieStore = await cookies();

  // Client com storage customizado que persiste em cookies HTTP-only
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => cookieStore.get(key)?.value ?? null,
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 dias
          });
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/");
}

// ─── Server Action: logout ────────────────────────────────────────────────────

export async function logout() {
  const cookieStore = await cookies();
  const cookieName = getCookieName();

  // Remove o cookie de sessão principal do Supabase
  cookieStore.delete(cookieName);

  // Remove variantes com sufixo (Supabase às vezes gera chunks: .0, .1, etc.)
  for (let i = 0; i < 5; i++) {
    cookieStore.delete(`${cookieName}.${i}`);
  }

  // Remove também os cookies legados caso existam
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  redirect("/login");
}
