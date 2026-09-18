# Studio Michelle Lima — Sistema de Agenda & Financeiro

Aplicação web para gerenciar clientes, procedimentos, agendamentos (calendário
interativo) e relatórios financeiros de uma clínica/espaço de beleza.

**Stack:** React + TypeScript + Vite + Tailwind CSS v4 + FullCalendar +
TanStack Query + Recharts no frontend, com uma API própria em Node.js +
Express + PostgreSQL "normal" (sem Supabase) cuidando dos dados e do login
(autenticação com JWT).

O projeto tem duas partes que rodam separadas:

```
clinica-app/        -> frontend (Vite/React), fala com a API via VITE_API_URL
clinica-app/server/ -> API (Express) + banco PostgreSQL
```

---

## 1. Banco de dados (PostgreSQL)

Você precisa de um Postgres rodando (local, numa VM, ou qualquer provedor
gerenciado — não precisa ser Supabase, pode ser qualquer Postgres).

Localmente no macOS, com Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb clinica_app
```

## 2. Configurar e rodar a API (`server/`)

```bash
cd clinica-app/server
npm install
cp .env.example .env
```

Edite o `.env` e ajuste pelo menos:

- `DATABASE_URL` — string de conexão com o Postgres do passo 1.
- `JWT_SECRET` — um valor aleatório e privado (ex.: `openssl rand -hex 32`).

Crie as tabelas e (opcionalmente) importe os dados de exemplo:

```bash
npm run migrate -- --seed   # sem --seed, cria só o schema vazio
```

Crie o primeiro login da equipe (substitui o antigo "criar usuário no painel
do Supabase"):

```bash
npm run create-user -- "Nome da pessoa" email@exemplo.com "senha-forte"
```

Rodar a API:

```bash
npm run dev
```

Ela sobe em `http://localhost:3001` (ajustável via `PORT` no `.env`).

## 3. Configurar e rodar o frontend

```bash
cd clinica-app
npm install
cp .env.example .env
```

Confirme que `VITE_API_URL` no `.env` aponta para a API do passo 2
(`http://localhost:3001` por padrão).

Rodar em desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

O build gera a pasta `dist/`, pronta para deploy em qualquer host estático
(Vercel, Netlify, etc). A API (`server/`) precisa ser hospedada separadamente
(Railway, Render, uma VM, etc.) — configure `VITE_API_URL` no frontend para
apontar para essa URL em produção, e `CORS_ORIGIN` na API para o domínio do
frontend em produção.

## 4. Estrutura do projeto

```
src/
  components/   -> Sidebar, Modal, AgendamentoModal (form do agendamento),
                    BotaoWhatsApp, StatusBadge, Layout
  hooks/        -> useClientes, useProcedimentos, useAgendamentos
                    (React Query + API própria)
  lib/          -> apiClient.ts (fetch com token JWT), auth.tsx (contexto de
                    login), calculations.ts (duração/preço/desconto/conflito),
                    whatsapp.ts (geração do link wa.me),
                    formatters.ts (moeda, data, máscaras)
  pages/        -> Dashboard, Agendamentos (calendário), Clientes,
                    Procedimentos, Relatorios, Login
  types/        -> tipos TypeScript das entidades

server/
  db/schema.sql -> schema do banco (tabelas + índices)
  db/seed.sql   -> dados de exemplo (migrados do Supabase original)
  src/routes/   -> auth, clientes, procedimentos, agendamentos (Express)
  src/middleware/auth.js -> valida o JWT em cada requisição
  scripts/      -> migrate.js (aplica schema/seed), create-user.js (cria
                    login da equipe)
```

> `supabase/schema.sql` e `backup.sql` na raiz são o schema e o dump antigos
> do Supabase, mantidos só como histórico/referência da migração — não são
> mais usados pela aplicação.

## 5. Como as regras de negócio foram implementadas

- **Duração total do agendamento**: soma automática de `duracao_min` de todos
  os procedimentos selecionados (`lib/calculations.ts` -> `somarDuracao`).
- **Hora de término**: `hora_inicio` + duração total (`somarMinutosAoHorario`).
- **Subtotal / Valor final**: soma dos preços dos procedimentos, com desconto
  em R$ ou % aplicado sobre o subtotal (`calcularValorFinal`).
- **Preço/duração "congelados"**: ao salvar um agendamento, o preço e a
  duração de cada procedimento são copiados para a tabela
  `agendamento_procedimentos` (colunas `preco_unitario` e `duracao_min`).
  Assim, se você reajustar o preço de um procedimento no futuro, os
  relatórios de meses anteriores continuam corretos.
- **Bloqueio de conflito de horário**: antes de salvar, o sistema verifica se
  o novo intervalo `[hora_inicio, hora_fim)` sobrepõe algum outro
  agendamento no mesmo dia (`existeConflito`) e impede o salvamento,
  mostrando o horário conflitante.
- **Bloco no calendário proporcional à duração**: o FullCalendar recebe
  `start`/`end` calculados a partir de `data` + `hora_inicio`/`hora_fim`, e
  renderiza a altura do bloco automaticamente proporcional ao intervalo.
- **Cor por status de confirmação**: verde-sálvia (confirmado) ou
  dourado (pendente), definida em `eventos` (página Agenda).
- **Botão do WhatsApp**: gera `https://wa.me/55<telefone>?text=<mensagem>`
  com a mensagem exata solicitada, disponível no card do dashboard e dentro
  do modal de edição do agendamento.

## 6. Próximos passos sugeridos (não incluídos nesta versão)

- Paginação/scroll infinito na lista de clientes para bases muito grandes.
- Exportação de relatórios em PDF/Excel.
- Perfis de acesso diferentes (ex: recepcionista vs. administradora) —
  hoje qualquer login em `usuarios` tem acesso total; isso exigiria uma
  coluna de perfil/role e checagens extras no middleware de autenticação
  da API.
- Code-splitting (o bundle de produção está com ~1,1MB; dá para reduzir
  carregando o FullCalendar e o Recharts sob demanda com `React.lazy`).
