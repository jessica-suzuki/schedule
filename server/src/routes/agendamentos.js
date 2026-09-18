import { Router } from 'express'
import { pool, withTransaction } from '../db.js'

export const agendamentosRouter = Router()

// Junta cliente + procedimentos (com o procedimento aninhado) num formato
// equivalente ao que o supabase.from('agendamentos').select(SELECT_COMPLETO)
// retornava antes.
async function anexarRelacoes(client, agendamentos, procedimentoIdFiltro) {
  if (agendamentos.length === 0) return agendamentos

  const ids = agendamentos.map((a) => a.id)
  const params = [ids]
  let filtroProcedimento = ''
  if (procedimentoIdFiltro) {
    params.push(procedimentoIdFiltro)
    filtroProcedimento = `and ap.procedimento_id = $${params.length}`
  }

  const { rows: vinculos } = await client.query(
    `select ap.id, ap.agendamento_id, ap.procedimento_id, ap.preco_unitario, ap.duracao_min,
            p.id as p_id, p.nome as p_nome, p.descricao as p_descricao,
            p.duracao_min as p_duracao_min, p.preco as p_preco, p.ativo as p_ativo,
            p.created_at as p_created_at
     from agendamento_procedimentos ap
     join procedimentos p on p.id = ap.procedimento_id
     where ap.agendamento_id = any($1::uuid[]) ${filtroProcedimento}`,
    params
  )

  const porAgendamento = new Map()
  for (const v of vinculos) {
    const lista = porAgendamento.get(v.agendamento_id) ?? []
    lista.push({
      id: v.id,
      agendamento_id: v.agendamento_id,
      procedimento_id: v.procedimento_id,
      preco_unitario: Number(v.preco_unitario),
      duracao_min: v.duracao_min,
      procedimento: {
        id: v.p_id,
        nome: v.p_nome,
        descricao: v.p_descricao,
        duracao_min: v.p_duracao_min,
        preco: Number(v.p_preco),
        ativo: v.p_ativo,
        created_at: v.p_created_at,
      },
    })
    porAgendamento.set(v.agendamento_id, lista)
  }

  return agendamentos.map((a) => ({
    ...a,
    subtotal: Number(a.subtotal),
    desconto_valor: Number(a.desconto_valor),
    valor_final: Number(a.valor_final),
    cliente: a.cliente_id
      ? {
          id: a.cliente_id,
          nome_completo: a.cliente_nome_completo,
          cpf: a.cliente_cpf,
          data_nasc: a.cliente_data_nasc,
          telefone: a.cliente_telefone,
          email: a.cliente_email,
          created_at: a.cliente_created_at,
        }
      : undefined,
    procedimentos: porAgendamento.get(a.id) ?? [],
  }))
}

const SELECT_AGENDAMENTO = `
  select
    a.*,
    c.nome_completo as cliente_nome_completo,
    c.cpf as cliente_cpf,
    c.data_nasc as cliente_data_nasc,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    c.created_at as cliente_created_at
  from agendamentos a
  left join clientes c on c.id = a.cliente_id
`

agendamentosRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `${SELECT_AGENDAMENTO} order by a.data asc, a.hora_inicio asc`
    )
    const comRelacoes = await anexarRelacoes(pool, rows)
    // remove os campos "cliente_*" espalhados, já foram agrupados em `cliente`
    res.json(comRelacoes.map(limparCamposCliente))
  } catch (err) {
    next(err)
  }
})

agendamentosRouter.get('/relatorio', async (req, res, next) => {
  try {
    const { dataInicio, dataFim, procedimentoId } = req.query

    const condicoes = []
    const params = []

    if (dataInicio) {
      params.push(dataInicio)
      condicoes.push(`a.data >= $${params.length}`)
    }
    if (dataFim) {
      params.push(dataFim)
      condicoes.push(`a.data <= $${params.length}`)
    }
    if (procedimentoId) {
      params.push(procedimentoId)
      condicoes.push(
        `exists (select 1 from agendamento_procedimentos ap where ap.agendamento_id = a.id and ap.procedimento_id = $${params.length})`
      )
    }

    const where = condicoes.length ? `where ${condicoes.join(' and ')}` : ''
    const { rows } = await pool.query(
      `${SELECT_AGENDAMENTO} ${where} order by a.data asc, a.hora_inicio asc`,
      params
    )
    const comRelacoes = await anexarRelacoes(pool, rows, procedimentoId || undefined)
    res.json(comRelacoes.map(limparCamposCliente))
  } catch (err) {
    next(err)
  }
})

function limparCamposCliente(a) {
  const {
    cliente_nome_completo,
    cliente_cpf,
    cliente_data_nasc,
    cliente_telefone,
    cliente_email,
    cliente_created_at,
    ...resto
  } = a
  return resto
}

function calcularDuracaoEntreHorarios(inicio, fim) {
  const [horaInicio, minutoInicio] = inicio.split(':').map(Number)
  const [horaFim, minutoFim] = fim.split(':').map(Number)
  return horaFim * 60 + minutoFim - (horaInicio * 60 + minutoInicio)
}

// Cria ou atualiza um agendamento e seus vínculos com procedimentos numa
// única transação (o supabase fazia isso em 2-3 chamadas separadas, sem
// garantia de atomicidade).
agendamentosRouter.post('/', async (req, res, next) => {
  try {
    const resultado = await salvar(null, req.body)
    res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
})

agendamentosRouter.put('/:id', async (req, res, next) => {
  try {
    const resultado = await salvar(req.params.id, req.body)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

async function salvar(id, body) {
  const { agendamento, procedimentos = [] } = body ?? {}
  const a = agendamento ?? {}

  const isBloqueio = a.tipo === 'bloqueio'
  const duracaoTotal = isBloqueio
    ? calcularDuracaoEntreHorarios(a.hora_inicio, a.hora_fim)
    : a.duracao_total_min

  return withTransaction(async (client) => {
    let agendamentoId = id

    const valores = [
      a.tipo || 'atendimento',
      isBloqueio ? null : a.cliente_id || null,
      isBloqueio ? (a.motivo || '').trim() : null,
      a.data,
      a.hora_inicio,
      a.hora_fim,
      duracaoTotal,
      isBloqueio ? 0 : a.subtotal,
      isBloqueio ? null : a.desconto_tipo || null,
      isBloqueio ? 0 : a.desconto_valor || 0,
      isBloqueio ? 0 : a.valor_final,
      isBloqueio ? null : a.forma_pagamento || null,
      isBloqueio ? null : a.observacao || null,
      isBloqueio ? false : Boolean(a.confirmado),
    ]

    if (agendamentoId) {
      await client.query(
        `update agendamentos set
           tipo = $1, cliente_id = $2, motivo = $3, data = $4, hora_inicio = $5,
           hora_fim = $6, duracao_total_min = $7, subtotal = $8, desconto_tipo = $9,
           desconto_valor = $10, valor_final = $11, forma_pagamento = $12,
           observacao = $13, confirmado = $14
         where id = $15`,
        [...valores, agendamentoId]
      )
      await client.query('delete from agendamento_procedimentos where agendamento_id = $1', [
        agendamentoId,
      ])
    } else {
      const { rows } = await client.query(
        `insert into agendamentos
           (tipo, cliente_id, motivo, data, hora_inicio, hora_fim, duracao_total_min,
            subtotal, desconto_tipo, desconto_valor, valor_final, forma_pagamento,
            observacao, confirmado)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         returning id`,
        valores
      )
      agendamentoId = rows[0].id
    }

    for (const p of procedimentos) {
      await client.query(
        `insert into agendamento_procedimentos (agendamento_id, procedimento_id, preco_unitario, duracao_min)
         values ($1, $2, $3, $4)`,
        [agendamentoId, p.id, p.preco, p.duracao_min]
      )
    }

    return { id: agendamentoId }
  })
}

agendamentosRouter.patch('/:id/confirmado', async (req, res, next) => {
  try {
    await pool.query('update agendamentos set confirmado = $1 where id = $2', [
      Boolean(req.body?.confirmado),
      req.params.id,
    ])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

agendamentosRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('delete from agendamentos where id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
