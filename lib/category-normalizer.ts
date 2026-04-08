/**
 * Category Normalizer
 *
 * Garante que categorias vindas do agente de IA (WhatsApp) sejam sempre
 * salvas de forma padronizada, independente de acentos, maiúsculas ou
 * pequenas variações de escrita.
 *
 * Estratégia:
 * 1. Normaliza o texto (remove acentos, lowercase, trim)
 * 2. Tenta match exato contra a lista canônica normalizada
 * 3. Tenta match fuzzy (distância de Levenshtein) com threshold configurável
 * 4. Se não bater, retorna o texto normalizado como nova categoria
 */

/** Lista canônica de categorias. Adicione novas categorias aqui. */
export const CANONICAL_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Moradia",
  "Vestuário",
  "Tecnologia",
  "Serviços",
  "Supermercado",
  "Farmácia",
  "Academia",
  "Pets",
  "Viagem",
  "Outros",
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

/** Remove acentos e normaliza o texto para comparação */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .toLowerCase()
    .trim();
}

/** Calcula a distância de Levenshtein entre duas strings */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Cria matriz de (m+1) x (n+1)
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Threshold máximo de distância para considerar um match fuzzy.
 * Valor menor = mais restritivo.
 * Ex: "alimentacao" vs "alimentação" → distância 0 (após normalização)
 *     "alimentaca"  vs "alimentação" → distância 1 → match
 *     "comida"      vs "alimentação" → distância alta → sem match
 */
const FUZZY_THRESHOLD = 3;

/**
 * Recebe a categoria enviada pelo agente e retorna a categoria canônica
 * correspondente, ou uma versão normalizada caso não haja match.
 */
export function normalizeCategory(rawCategory: string): string {
  const normalizedInput = normalize(rawCategory);

  // 1. Tenta match exato (após normalização)
  for (const canonical of CANONICAL_CATEGORIES) {
    if (normalize(canonical) === normalizedInput) {
      return canonical;
    }
  }

  // 2. Tenta match fuzzy
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const canonical of CANONICAL_CATEGORIES) {
    const distance = levenshtein(normalize(canonical), normalizedInput);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = canonical;
    }
  }

  if (bestMatch && bestDistance <= FUZZY_THRESHOLD) {
    return bestMatch;
  }

  // 3. Nenhum match — capitaliza a primeira letra e retorna normalizado
  const capitalized =
    rawCategory.trim().charAt(0).toUpperCase() + rawCategory.trim().slice(1).toLowerCase();
  return capitalized;
}
