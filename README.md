# METEFICHA.BET — Plataforma Demonstrativa de Cassino & Sportsbook

> Status atual: **FASE 0 — Planejamento técnico concluído.** Nenhuma tela, tabela ou função foi implementada ainda. Aguardando comando explícito do usuário para iniciar a FASE 1.

## 1. Visão geral

Meteficha.bet é um protótipo **100% demonstrativo** de cassino online + sportsbook, construído com:

- **Frontend:** TanStack Start v1 (React 19 + TypeScript + Vite 7), roteamento por arquivos em `src/routes`, Tailwind CSS v4 com tokens semânticos em `src/styles.css`, shadcn/ui em `src/components/ui`.
- **Backend:** Lovable Cloud (Supabase) — Postgres + Auth + RLS + Edge Functions/RPC para toda lógica sensível (saldo virtual, bilhetes, simulador).
- **Dados:** 100% reais no banco (sem mocks em produção do protótipo), porém **conceitualmente demonstrativos** — saldo, apostas, odds e resultados são virtuais, nunca conversíveis em dinheiro real.

Nenhuma operação financeira real (depósito, saque, pagamento, carteira real, conversão de saldo) existe ou existirá nesta fase, nem no frontend nem no backend/RLS.

## 2. Identidade visual (resumo)

- Direção: **Cyberpunk Premium** — fundo `#080914`, superfícies azul-marinho quase preto, azul `#2563EB`, azul luminoso `#38BDF8`, roxo neon `#A855F7`.
- Tokens centralizados em `src/styles.css` (`:root` + `@theme inline`), nunca cores cruas nos componentes.
- Layout: sidebar (desktop) / navegação inferior fixa (mobile) / adaptação própria em tablet.
- Wordmark tipográfico próprio + slogan editável ("Entre no jogo. Explore outro nível.") sem promessa de ganho.

## 3. Arquitetura proposta (alto nível)

```
src/
  routes/              # paginas por arquivo (index, auth, admin.*, cassino.*, esportes.*, etc.)
  components/ui/       # shadcn
  components/casino/   # cards de jogo, carrosseis, filtros
  components/sports/   # eventos, mercados, boletim
  components/admin/    # tabelas, formularios, dashboard admin
  lib/                 # createServerFn: saldo, bilhetes, simulador, auditoria
  integrations/supabase/ # client + types gerados (NUNCA editar manualmente)
  styles.css           # tokens de design (cyberpunk premium)
```

Regras de arquitetura fixadas:

- Nenhuma autorização ou cálculo de saldo/bilhete confiado ao frontend — tudo via RPC/Edge Function com `security definer` quando necessário.
- Transações que alteram múltiplas tabelas (bilhete + saldo) ocorrem em função SQL atômica.
- Papéis (`admin`/`user`) exclusivamente em `user_roles` + `has_role()`, nunca em `profiles`.
- Modo demonstrativo com identificador de ambiente validado no backend (não é uma flag de frontend).
- Bloqueio centralizado de operações financeiras reais (função/guard que sempre rejeita, usada como "seam" para integração futura autorizada).
- Segredos de provedores/gateways futuros: apenas em variáveis de ambiente de servidor / `integration_configs` com campos sensíveis nunca legíveis pelo cliente.

## 4. Modelo de dados (proposto para a FASE 2 em diante)

Domínios já mapeados no prompt mestre (serão criados tabela por tabela, fase a fase, sempre com `CREATE -> GRANT -> ENABLE RLS -> POLICY`):

- **Usuários:** `profiles`, `user_roles` (+`app_role` enum), `user_favorites`, `user_recent_games`.
- **Catálogo de cassino:** `game_providers`, `games`, `game_categories`, `game_category_links`, `game_sessions`.
- **Esportes:** `sports`, `competitions`, `participants`, `events`, `markets`, `selections`, `odds_history`.
- **Carteira/bilhetes demonstrativos:** `demo_wallets`, `demo_wallet_transactions`, `demo_tickets`, `demo_ticket_selections` (valores em `numeric` preciso, nunca float; saldo nunca negativo; débito/crédito atômico via RPC).
- **Administração:** `banners`, `site_settings`, `audit_logs`.
- **Integrações (preparação futura, inativas):** `integration_configs`, `integration_health`, `webhook_events`.
- **Simulador:** `simulation_scenarios`, `simulation_runs`, além de uma tabela/flag de **pausa global** auditável.

Essas tabelas **ainda não foram criadas** — serão propostas em SQL incremental na FASE 2 (fundação de auth/perfis) e expandidas nas fases 3 a 6, sempre com aprovação explícita do usuário antes da execução.

## 5. Riscos e dependências identificados

- Repositório está vazio (apenas este README): não há template Atlas, nem `src/`, nem `supabase/` ainda neste branch — a FASE 1 precisará criar a fundação do projeto (rotas, tokens de design, layout) antes de qualquer tela de negócio.
- Nenhuma credencial de gateway de pagamento ou provedor de jogos/odds está disponível nem será usada — todos os adaptadores futuros ficam com status "desativado"/"não configurado" até validação jurídica e técnica reais.
- Simulador com automação por etapas exige mecanismo confiável de execução (ex.: função agendada no backend); isso será avaliado tecnicamente na FASE 5, com alternativa explícita (execução manual acionada pelo admin) caso o agendamento automático não esteja disponível.
- Qualquer menção a "integração ativa" só será feita após validação real de conexão — por ora todo provedor fica marcado como demonstrativo.

## 6. Plano de execução por fases (ordem obrigatória, uma por vez)

| Fase | Entregável | Depende de aprovação do usuário |
|---|---|---|
| 0 | Este plano técnico | — (concluída) |
| 1 | Fundação visual (tokens cyberpunk premium, layout responsivo, navegação, rotas base) | Sim |
| 2 | Supabase: `profiles`, `app_role`, `user_roles`, `has_role`, auth (cadastro/login/logout/recuperação), RLS base | Sim |
| 3 | Catálogo demonstrativo de cassino (lobby, categorias, favoritos, recentes, admin de jogos) | Sim |
| 4 | Sportsbook demonstrativo + bilhetes fictícios (boletim, RPC de confirmação atômica) | Sim |
| 5 | Simulador controlado + pausa global auditável | Sim |
| 6 | Painel administrativo completo (dashboard, auditoria, integrações, relatórios) | Sim |
| 7 | Segurança, testes de aceitação negativos e otimização | Sim |

Nenhuma fase além da 0 foi iniciada. Para seguir, o usuário deve indicar explicitamente "iniciar FASE 1" (ou a fase desejada).

## 7. Pendências explícitas

- Confirmar nome definitivo do repositório/projeto conectado ao Lovable Cloud (Supabase) para a FASE 2.
- Confirmar política de saldo inicial demonstrativo (valor padrão sugerido no prompt: 10.000 unidades virtuais, editável e identificado como fictício) antes de gerar o SQL de `demo_wallets`.
- Confirmar se haverá mecanismo de agendamento confiável no backend para o simulador (FASE 5) ou se a automação será disparada manualmente pelo admin.

*Nenhum dado real, SQL de schema ou componente de produto foi criado nesta etapa — este documento é exclusivamente o plano técnico da FASE 0.*
