-- =========================================================
-- Studio Michelle Lima — Schema do banco de dados (PostgreSQL / Supabase)
-- Execute este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- =========================================================

create extension if not exists "pgcrypto";

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

alter table agendamentos add column if not exists tipo text not null default 'atendimento';
alter table agendamentos add column if not exists motivo text;
alter table agendamentos alter column cliente_id drop not null;

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
-- ROW LEVEL SECURITY
-- Este é um sistema interno de uso da equipe da clínica (não é
-- multi-tenant público). O modelo abaixo libera acesso completo
-- para qualquer usuário autenticado no seu projeto Supabase
-- (ou seja: a própria equipe, que faz login pelo app).
-- Ajuste as políticas se quiser níveis de acesso diferentes
-- (ex: recepcionista vs. administradora).
-- =========================================================

alter table clientes enable row level security;
alter table procedimentos enable row level security;
alter table agendamentos enable row level security;
alter table agendamento_procedimentos enable row level security;

create policy "Usuários autenticados podem tudo em clientes"
  on clientes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem tudo em procedimentos"
  on procedimentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem tudo em agendamentos"
  on agendamentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem tudo em agendamento_procedimentos"
  on agendamento_procedimentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =========================================================
-- DADOS DE EXEMPLO (opcional — remova se não quiser dados de teste)
-- =========================================================

insert into procedimentos (nome, descricao, duracao_min, preco) values
  ('Design de sobrancelhas', 'Design com henna', 40, 60.00),
  ('Limpeza de pele', 'Limpeza profunda facial', 60, 150.00),
  ('Massagem relaxante', 'Massagem corporal 60min', 60, 180.00)
on conflict do nothing;
