-- =========================================================
-- Studio Michelle Lima — Schema do banco de dados
-- PostgreSQL "normal" (sem Supabase). Execute com:
--   psql "$DATABASE_URL" -f db/schema.sql
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- USUARIOS (login da equipe — substitui o Supabase Auth)
-- ---------------------------------------------------------
create table if not exists usuarios (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text not null unique,
  senha_hash  text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PASSWORD_RESET_TOKENS ("esqueci minha senha" por e-mail)
-- Guardamos só o hash do token (nunca o valor em texto puro que vai por
-- e-mail) — mesma lógica de por que senha_hash nunca guarda a senha crua.
-- ---------------------------------------------------------
create table if not exists password_reset_tokens (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_reset_usuario on password_reset_tokens (usuario_id);

-- ---------------------------------------------------------
-- CLIENTES
-- ---------------------------------------------------------
create table if not exists clientes (
  id            uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  cpf           text not null unique,
  data_nasc     date,
  telefone      text not null,
  email         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PROCEDIMENTOS
-- ---------------------------------------------------------
create table if not exists procedimentos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  duracao_min integer not null check (duracao_min > 0),
  preco       numeric(10,2) not null check (preco >= 0),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------
-- AGENDAMENTOS
-- ---------------------------------------------------------
create table if not exists agendamentos (
  id                uuid primary key default gen_random_uuid(),
  tipo              text not null default 'atendimento' check (tipo in ('atendimento', 'bloqueio')),
  cliente_id        uuid references clientes(id) on delete restrict,
  motivo            text,
  data              date not null,
  hora_inicio       time not null,
  hora_fim          time not null,
  duracao_total_min integer not null,
  subtotal          numeric(10,2) not null,
  desconto_tipo     text check (desconto_tipo in ('percentual', 'valor')),
  desconto_valor    numeric(10,2) not null default 0,
  valor_final       numeric(10,2) not null,
  forma_pagamento   text check (forma_pagamento in ('pix', 'credito', 'debito', 'dinheiro')),
  observacao        text,
  confirmado        boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists idx_agendamentos_data on agendamentos (data);
create index if not exists idx_agendamentos_cliente on agendamentos (cliente_id);

-- ---------------------------------------------------------
-- AGENDAMENTO_PROCEDIMENTOS (N:N com snapshot de preço/duração)
-- ---------------------------------------------------------
create table if not exists agendamento_procedimentos (
  id              uuid primary key default gen_random_uuid(),
  agendamento_id  uuid not null references agendamentos(id) on delete cascade,
  procedimento_id uuid not null references procedimentos(id) on delete restrict,
  preco_unitario  numeric(10,2) not null,
  duracao_min     integer not null
);

create index if not exists idx_agproc_agendamento on agendamento_procedimentos (agendamento_id);

-- =========================================================
-- Observação sobre segurança:
-- Este banco não usa Row Level Security (isso era específico do
-- Supabase). O controle de acesso agora é feito pela API em server/
-- (middleware de autenticação com JWT) — só chega até aqui quem já
-- passou pelo login. O banco em si não deve ficar exposto à internet.
-- =========================================================
