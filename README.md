# Dashboard pessoal de gastos

Dashboard interativo para controle de gastos mensais com ingestão automática via agente de IA (WhatsApp → webhook → Supabase) e visualização em tempo real.

---

## Como funciona

```
Mensagem no WhatsApp
        │
        ▼
  Agente de IA (n8n / Make / custom)
  interpreta o texto e extrai categoria + valor
        │
        ▼
  POST /api/webhooks/expenses
  (Header: x-webhook-secret)
        │
        ▼
  Supabase (PostgreSQL)
        │
        ▼
  Dashboard Next.js — atualizado automaticamente
```

Você manda uma mensagem do tipo _"gastei 85 reais no mercado"_ e o agente registra o gasto sem você abrir nenhum app.

---

## Stack

- **Next.js 16** + **React 19** + TypeScript + App Router
- **Tailwind CSS** (tema dark customizado)
- **Supabase** — PostgreSQL + Auth
- **Recharts** — gráficos de evolução diária e distribuição por categoria
- **date-fns** — formatação de datas em pt-BR

---

## 1. Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (plano free é suficiente)

---

## 2. Clonar e instalar

```bash
git clone <repo-url>
cd dashboard
npm install
```

---

## 3. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase — Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # somente servidor — nunca exponha no cliente

# Webhook — segredo compartilhado com o agente de IA
WEBHOOK_SECRET=<string aleatória e segura>
```

### Onde encontrar as chaves no Supabase

| Variável | Localização |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → Project API keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → Project API keys → service_role |

---

## 4. Criar schema no Supabase

No **SQL Editor** do Supabase, execute o arquivo `supabase/schema.sql`.

Ele cria:
- Tabela `expenses` com os campos: `id`, `occurred_at`, `description`, `category`, `amount_cents`, `source`, `external_id`, `created_at`
- Índice único em `external_id` (evita duplicatas do agente)
- Índices em `occurred_at` e `category` para consultas rápidas

---

## 5. Criar usuário de acesso

O dashboard é protegido por login. Para criar um usuário:

1. Acesse **Supabase Dashboard → Authentication → Users**
2. Clique em **Add user**
3. Informe e-mail e senha

> Signup público está **desativado** intencionalmente. Apenas usuários criados pelo admin têm acesso.

---

## 6. Rodar localmente

```bash
npm run dev
```

Abra `http://localhost:3000` — você será redirecionado para a tela de login.

---

## 7. Autenticação

O dashboard usa **Supabase Auth** com sessão gerenciada via cookies HTTP-only.

### Fluxo de login

```
Acesso a qualquer rota protegida
        │
  middleware.ts valida o cookie de sessão (Edge)
        │
  Sessão ausente/expirada ──► redirect /login
        │
  Usuário preenche e-mail + senha
        │
  Server Action login() → supabase.auth.signInWithPassword()
        │
  Sucesso ──► seta cookies HTTP-only ──► redirect /
  Erro    ──► mensagem inline (sem reload de página)
```

### Fluxo de logout

Botão **"Sair"** no canto superior direito do dashboard → Server Action `logout()` → cookies apagados → redirect `/login`.

### Arquivos de auth

| Arquivo | Responsabilidade |
|---|---|
| `lib/supabase/client.ts` | Singleton browser (Client Components) |
| `lib/supabase/server.ts` | Client server-side com storage de cookie customizado |
| `app/actions/auth.ts` | Server Actions `login()` e `logout()` |
| `app/login/page.tsx` | Tela de login |
| `middleware.ts` | Proteção de rotas via Edge Runtime |
| `components/logout-button.tsx` | Botão de logout no header |

---

## 8. API de ingestão (webhook)

### `POST /api/webhooks/expenses`

Endpoint chamado pelo agente de IA para registrar um novo gasto.

**Header obrigatório:**

```
x-webhook-secret: <WEBHOOK_SECRET>
```

**Body JSON:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `category` | string | ✅ | Categoria do gasto (normalizada automaticamente) |
| `amount_cents` | number | ✅ | Valor em centavos (ex: R$ 85,90 → `8590`) |
| `occurred_at` | string (ISO 8601) | ❌ | Data do gasto. Se omitido, usa `now()` |
| `description` | string | ❌ | Descrição livre. Se omitido, usa a categoria normalizada |
| `external_id` | string | ❌ | ID externo para evitar duplicatas |
| `source` | string | ❌ | Origem do registro (padrão: `"ai-agent"`) |

**Exemplo com curl:**

```bash
curl -X POST http://localhost:3000/api/webhooks/expenses \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu_segredo" \
  -d '{
    "occurred_at": "2026-04-09T12:30:00.000Z",
    "description": "Mercado",
    "category": "Alimentação",
    "amount_cents": 8590,
    "external_id": "evt_123",
    "source": "ai-agent"
  }'
```

**Resposta de sucesso (`201`):**

```json
{ "ok": true, "expense_id": "uuid" }
```

### Normalização de categorias

A categoria enviada pelo agente é normalizada automaticamente via distância de Levenshtein. Isso garante que variações como `"alimentacao"`, `"Alimentação"` ou `"alimentaçao"` sejam salvas como `"Alimentação"`.

Categorias canônicas disponíveis:

> Alimentação · Transporte · Saúde · Educação · Lazer · Moradia · Vestuário · Tecnologia · Serviços · Supermercado · Farmácia · Academia · Pets · Viagem · Outros

---

## 9. Outros endpoints internos

### `POST /api/expenses`

Cria um gasto manualmente (sem autenticação de webhook). Usado pelo dashboard para inserções manuais.

**Body:** `{ category, amount_cents, occurred_at? }`

### `PATCH /api/expenses/:id`

Edita um gasto existente.

**Body (campos opcionais):** `{ category?, amount_cents?, occurred_at? }`

### `DELETE /api/expenses/:id`

Remove um gasto pelo ID.

---

## 10. Funcionalidades do dashboard

- Seleção de mês para filtrar despesas
- Cards de resumo: total gasto, quantidade de lançamentos, ticket médio
- Gráfico de evolução diária dos gastos
- Gráfico de distribuição por categoria (pizza)
- Tabela de lançamentos com data, descrição, categoria e valor
- Estado vazio quando não há dados no mês selecionado
- Edição e exclusão de lançamentos diretamente na tabela

---

## 11. Estrutura do projeto

```
app/
  actions/auth.ts          # Server Actions de login/logout
  api/
    expenses/              # CRUD interno de despesas
    webhooks/expenses/     # Endpoint para o agente de IA
  login/page.tsx           # Tela de login
  page.tsx                 # Dashboard (rota principal, protegida)
components/
  dashboard-view.tsx       # Componente principal do dashboard
  logout-button.tsx        # Botão de logout
lib/
  supabase/
    client.ts              # Client browser
    server.ts              # Client server-side
  supabase-admin.ts        # Client admin (service_role)
  category-normalizer.ts   # Normalização fuzzy de categorias
  expense-utils.ts         # Utilitários de formatação
middleware.ts              # Proteção de rotas (Edge Runtime)
supabase/
  schema.sql               # Schema do banco de dados
types/
  expense.ts               # Tipos TypeScript
```
