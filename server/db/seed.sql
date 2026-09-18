-- =========================================================
-- Dados existentes, migrados do backup do Supabase (backup.sql
-- na raiz do projeto) para preservar o que já estava cadastrado.
-- Execute depois do schema.sql:
--   psql "$DATABASE_URL" -f db/seed.sql
-- =========================================================

insert into procedimentos (id, nome, descricao, duracao_min, preco, ativo, created_at) values
  ('924292bc-5576-452d-9f6e-82c5247710bf', 'Design de sobrancelhas', 'Design com henna', 40, 60.00, true, '2026-09-02 17:21:38.153704+00'),
  ('f629a7e4-0c39-4df8-9f7e-34d713bcca6f', 'Limpeza de pele', 'Limpeza profunda facial', 60, 150.00, true, '2026-09-02 17:21:38.153704+00'),
  ('a81e72a2-0ec7-4436-9785-2ae7816eb881', 'Massagem relaxante', 'Massagem corporal 60min', 60, 180.00, true, '2026-09-02 17:21:38.153704+00'),
  ('d0f1d50e-c7cc-45e9-9ebd-09d16e7f4dd1', 'Depilação pernas', null, 60, 80.00, true, '2026-09-02 17:58:39.697452+00'),
  ('bbf3394d-e55d-4ed2-be7f-c4a569198a2a', 'Lash', null, 30, 30.00, true, '2026-09-04 13:22:55.330864+00')
on conflict (id) do nothing;

insert into clientes (id, nome_completo, cpf, data_nasc, telefone, email, created_at) values
  ('cfcfb488-a1e5-4c59-b3eb-ba680a56c749', 'Ana Maria', '199.317.390-02', '1993-06-20', '(61) 99693-2727', 'ana@yopmail.com', '2026-09-02 17:57:31.836454+00'),
  ('ac1ef06d-0ca4-43f3-a003-625faa3ba509', 'Carla Silva', '953.596.290-61', '1993-06-20', '(61) 99693-2727', null, '2026-09-02 17:58:04.399376+00'),
  ('b27e9b05-0656-48c7-b1c3-c072f98d0320', 'Ana Marcela Silva', '012.144.243-22', '1989-05-02', '(61) 92939-3838', null, '2026-09-04 13:22:17.627477+00')
on conflict (id) do nothing;

insert into agendamentos (id, cliente_id, data, hora_inicio, hora_fim, duracao_total_min, subtotal, desconto_tipo, desconto_valor, valor_final, forma_pagamento, observacao, confirmado, created_at, tipo, motivo) values
  ('fcef725c-46e2-4094-960f-588bd80d8738', 'cfcfb488-a1e5-4c59-b3eb-ba680a56c749', '2026-09-03', '08:00:00', '09:40:00', 100, 140.00, 'percentual', 10.00, 126.00, null, null, true, '2026-09-02 17:59:19.444816+00', 'atendimento', null),
  ('7bcb1c38-e9c0-43ca-904c-835670ad1f3d', 'ac1ef06d-0ca4-43f3-a003-625faa3ba509', '2026-09-03', '10:30:00', '11:30:00', 60, 150.00, 'valor', 0.00, 150.00, null, null, false, '2026-09-02 18:01:08.731992+00', 'atendimento', null),
  ('880eb575-24a8-4c87-84fe-f71a07336fe1', 'b27e9b05-0656-48c7-b1c3-c072f98d0320', '2026-09-04', '10:30:00', '11:30:00', 60, 80.00, 'percentual', 5.00, 76.00, 'pix', null, true, '2026-09-04 13:22:41.549187+00', 'atendimento', null)
on conflict (id) do nothing;

insert into agendamento_procedimentos (id, agendamento_id, procedimento_id, preco_unitario, duracao_min) values
  ('7a8053a4-e941-40a8-b87a-351edb074bb1', 'fcef725c-46e2-4094-960f-588bd80d8738', 'd0f1d50e-c7cc-45e9-9ebd-09d16e7f4dd1', 80.00, 60),
  ('39b54ab0-80ec-43a7-a5ba-e5faca730716', 'fcef725c-46e2-4094-960f-588bd80d8738', '924292bc-5576-452d-9f6e-82c5247710bf', 60.00, 40),
  ('bbacddc2-6d35-44d2-b2c3-68100aa753ae', '7bcb1c38-e9c0-43ca-904c-835670ad1f3d', 'f629a7e4-0c39-4df8-9f7e-34d713bcca6f', 150.00, 60),
  ('e8efc011-67f3-4d21-aca2-676c41b14b78', '880eb575-24a8-4c87-84fe-f71a07336fe1', 'd0f1d50e-c7cc-45e9-9ebd-09d16e7f4dd1', 80.00, 60)
on conflict (id) do nothing;
