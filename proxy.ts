import { NextRequest, NextResponse } from "next/server";

// Rotas públicas — qualquer outra é protegida
const PUBLIC_PATHS = ["/login", "/signup", "/api/webhooks"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Verifica de forma otimista se existe um cookie de sessão do Supabase.
 * NÃO valida o token contra a API — isso é responsabilidade das Server Components/Actions.
 * Conforme recomendado pelo Next.js 16: proxy deve fazer apenas leitura de cookie.
 */
function hasSessionCookie(request: NextRequest): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef = supabaseUrl
    .replace("https://", "")
    .split(".")[0];

  const cookieName = `sb-${projectRef}-auth-token`;

  // Verifica cookie simples
  if (request.cookies.get(cookieName)?.value) return true;

  // Verifica chunks (.0, .1, ...)
  for (let i = 0; i < 5; i++) {
    if (request.cookies.get(`${cookieName}.${i}`)?.value) return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deixa passar assets estáticos e internos do Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.+)$/)
  ) {
    return NextResponse.next();
  }

  const hasSession = hasSessionCookie(request);

  // Já autenticado tentando acessar /login ou /signup → vai para /
  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rota pública → deixa passar
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Rota protegida sem sessão → vai para /login
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
