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

// ─── Server Action: signup ────────────────────────────────────────────────────

export type SignupState = {
  error: string | null;
  success?: boolean;
};

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvOrThrow();
  const cookieStore = await cookies();

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

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // Se o Supabase exigir confirmação de e-mail, a sessão não vem imediatamente
  if (!data.session) {
    return {
      error: null,
      success: true,
    };
  }

  redirect("/");
}

// ─── Server Action: updateProfile ────────────────────────────────────────────

export type UpdateProfileState = {
  error: string | null;
  success?: boolean;
};

export async function updateEmail(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const newEmail = formData.get("email") as string;
  if (!newEmail) return { error: "Informe o novo e-mail." };

  const { supabaseUrl, supabaseAnonKey } = getEnvOrThrow();
  const cookieStore = await cookies();

  // Precisamos do access token do cookie para autenticar
  const ref = supabaseUrl.split(".")[0].replace("https://", "");
  const cookieName = `sb-${ref}-auth-token`;
  const cookieValue = cookieStore.get(cookieName)?.value ?? null;

  let accessToken: string | null = null;
  if (cookieValue) {
    try {
      const decoded = Buffer.from(decodeURIComponent(cookieValue), "base64").toString("utf-8");
      accessToken = JSON.parse(decoded).access_token ?? null;
    } catch {
      try {
        accessToken = JSON.parse(decodeURIComponent(cookieValue)).access_token ?? null;
      } catch {
        accessToken = null;
      }
    }
  }

  if (!accessToken) return { error: "Sessão expirada. Faça login novamente." };

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: "Erro ao atualizar e-mail." };

  return { error: null, success: true };
}

export async function updatePassword(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const newPassword = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) return { error: "Preencha todos os campos." };
  if (newPassword.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };
  if (newPassword !== confirmPassword) return { error: "As senhas não coincidem." };

  const { supabaseUrl, supabaseAnonKey } = getEnvOrThrow();
  const cookieStore = await cookies();

  const ref = supabaseUrl.split(".")[0].replace("https://", "");
  const cookieName = `sb-${ref}-auth-token`;
  const cookieValue = cookieStore.get(cookieName)?.value ?? null;

  let accessToken: string | null = null;
  if (cookieValue) {
    try {
      const decoded = Buffer.from(decodeURIComponent(cookieValue), "base64").toString("utf-8");
      accessToken = JSON.parse(decoded).access_token ?? null;
    } catch {
      try {
        accessToken = JSON.parse(decodeURIComponent(cookieValue)).access_token ?? null;
      } catch {
        accessToken = null;
      }
    }
  }

  if (!accessToken) return { error: "Sessão expirada. Faça login novamente." };

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Erro ao atualizar senha." };

  return { error: null, success: true };
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
