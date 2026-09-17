# Studio Michelle Lima — Sistema de Agenda & Financeiro

Aplicação web para gerenciar clientes, procedimentos, agendamentos (calendário
interativo) e relatórios financeiros de uma clínica/espaço de beleza.

**Stack:** React + TypeScript + Vite + Tailwind CSS v4 + Supabase (PostgreSQL,
Auth) + FullCalendar + TanStack Query + Recharts.

---

## 1. Criar o projeto no Supabase

1. Crie uma conta e um novo projeto em https://supabase.com.
2. No painel do projeto, vá em **SQL Editor** → cole todo o conteúdo do
   arquivo `supabase/schema.sql` deste repositório → clique em **Run**.
   Isso cria as 4 tabelas (`clientes`, `procedimentos`, `agendamentos`,
   `agendamento_procedimentos`), os índices, as políticas de RLS e alguns
   procedimentos de exemplo.
3. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public key`
4. Vá em **Authentication → Users → Add user** e crie o login da equipe
   (e-mail + senha). É esse login que será usado para entrar no sistema.

## 2. Configurar o projeto localmente

```bash
cd clinica-app
npm install
cp .env.example .env
```

Edite o arquivo `.env` e preencha:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

O build gera a pasta `dist/`, pronta para deploy em qualquer host estático
(Vercel, Netlify, etc). Recomendação: importar o repositório na Vercel e
configurar as duas variáveis de ambiente acima no painel do projeto.

## 3. Estrutura do projeto

```
src/
  components/   -> Sidebar, Modal, AgendamentoModal (form do agendamento),
                    BotaoWhatsApp, StatusBadge, Layout
  hooks/        -> useClientes, useProcedimentos, useAgendamentos
                    (React Query + Supabase)
  lib/          -> calculations.ts (duração/preço/desconto/conflito),
                    whatsapp.ts (geração do link wa.me),
                    formatters.ts (moeda, data, máscaras)
  pages/        -> Dashboard, Agendamentos (calendário), Clientes,
                    Procedimentos, Relatorios, Login
  types/        -> tipos TypeScript das entidades
supabase/
  schema.sql    -> schema completo + RLS + dados de exemplo
```

## 4. Como as regras de negócio foram implementadas

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

## 5. Próximos passos sugeridos (não incluídos nesta versão)

- Paginação/scroll infinito na lista de clientes para bases muito grandes.
- Exportação de relatórios em PDF/Excel.
- Perfis de acesso diferentes (ex: recepcionista vs. administradora) via
  RLS mais granular no Supabase.
- Code-splitting (o bundle de produção está com ~1,1MB; dá para reduzir
  carregando o FullCalendar e o Recharts sob demanda com `React.lazy`).
