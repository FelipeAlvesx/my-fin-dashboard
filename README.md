# Dashboard pessoal de gastos

Dashboard interativo para controle de gastos mensais, com ingestão automática via webhook (agente de IA) e persistência no Supabase.

## Stack

- Next.js 16 + TypeScript + App Router
- Tailwind CSS
- Supabase (PostgreSQL)
- Recharts

## 1) Instalar e rodar local

```bash
npm install
npm run dev
```

Abra: `http://localhost:3000`

## 2) Configurar variáveis de ambiente

Crie `.env.local` com base em `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WEBHOOK_SECRET=
```

### Onde pegar no Supabase

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API key (anon/public)
- `SUPABASE_SERVICE_ROLE_KEY`: Project API key (service_role) **(somente servidor)**

## 3) Criar schema no Supabase

No SQL Editor do Supabase, execute o arquivo:

- `supabase/schema.sql`

Isso cria a tabela `expenses` e índices para consulta mensal e categoria.

## 4) Webhook para entrada dos gastos

Endpoint:

- `POST /api/webhooks/expenses`

Header obrigatório:

- `x-webhook-secret: <WEBHOOK_SECRET>`

Body JSON obrigatório:

```json
{
  "occurred_at": "2026-04-03T12:30:00.000Z",
  "description": "Mercado",
  "category": "Alimentação",
  "amount_cents": 8590,
  "external_id": "evt_123",
  "source": "ai-agent"
}
```

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3000/api/webhooks/expenses \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu_segredo" \
  -d '{
    "occurred_at": "2026-04-03T12:30:00.000Z",
    "description": "Mercado",
    "category": "Alimentação",
    "amount_cents": 8590,
    "external_id": "evt_123",
    "source": "ai-agent"
  }'
```

## 5) Funcionalidades já implementadas

- Sessão de meses para filtrar despesas
- Cards de total, quantidade e ticket médio
- Gráfico de evolução diária
- Gráfico de distribuição por categoria
- Tabela de lançamentos por mês
- Estado vazio quando ainda não há dados

## Próximo passo (quando você quiser)

Assim que você me passar as credenciais do Supabase (ou confirmar que já configurou `.env.local`), eu te guio na validação ponta a ponta com dados reais do webhook.
