import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rotas que NÃO precisam de autenticação
const PUBLIC_PATHS = ["/login", "/api/webhooks"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

// O Supabase JS v2 armazena a sessão num cookie chamado sb-<projectRef>-auth-token
// Pode ser dividido em chunks: sb-<ref>-auth-token.0, .1, etc.
function getProjectRef(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!.split(".")[0].replace(
    "https://",
    "",
  );
}

/**
 * Reconstrói o access_token a partir do cookie de sessão do Supabase.
 * O Supabase armazena um JSON base64 no cookie; para sessões grandes, divide em chunks.
 */
function getAccessTokenFromRequest(request: NextRequest): string | null {
  const ref = getProjectRef();
  const cookieName = `sb-${ref}-auth-token`;

  // Tenta primeiro o cookie simples
  let raw = request.cookies.get(cookieName)?.value ?? null;

  // Se não encontrou, tenta reconstruir chunks (.0, .1, ...)
  if (!raw) {
    let chunks = "";
    for (let i = 0; i < 10; i++) {
      const chunk = request.cookies.get(`${cookieName}.${i}`)?.value;
      if (!chunk) break;
      chunks += chunk;
    }
    raw = chunks || null;
  }

  if (!raw) return null;

  // O valor é um JSON com { access_token, refresh_token, ... }
  try {
    const decoded = Buffer.from(
      decodeURIComponent(raw),
      "base64",
    ).toString("utf-8");
    const parsed = JSON.parse(decoded);
    return parsed.access_token ?? null;
  } catch {
    // Pode ser texto puro em alguns casos
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      return parsed.access_token ?? null;
    } catch {
      return null;
    }
  }
}

async function validateToken(accessToken: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    return !error && !!data.user;
  } catch {
    return false;
  }
}

function clearSessionCookies(response: NextResponse): void {
  const ref = getProjectRef();
  const cookieName = `sb-${ref}-auth-token`;

  response.cookies.delete(cookieName);
  for (let i = 0; i < 5; i++) {
    response.cookies.delete(`${cookieName}.${i}`);
  }
  // Legados
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deixa passar assets estáticos e internos do Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const accessToken = getAccessTokenFromRequest(request);

  // Se está tentando acessar /login já autenticado → redireciona para /
  if (pathname === "/login") {
    if (accessToken) {
      const valid = await validateToken(accessToken);
      if (valid) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // Rotas públicas (ex: /api/webhooks)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Rota protegida — sem token → vai para login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Valida o token
  const valid = await validateToken(accessToken);

  if (!valid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearSessionCookies(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o proxy em todas as rotas EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
