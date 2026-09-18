import { Router } from 'express'
import { pool } from '../db.js'

export const procedimentosRouter = Router()

procedimentosRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'select * from procedimentos order by nome asc'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

procedimentosRouter.post('/', async (req, res, next) => {
  try {
    const p = req.body ?? {}
    const { rows } = await pool.query(
      `insert into procedimentos (nome, descricao, duracao_min, preco, ativo)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [p.nome, p.descricao || null, p.duracao_min, p.preco, p.ativo ?? true]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

procedimentosRouter.put('/:id', async (req, res, next) => {
  try {
    const p = req.body ?? {}
    const { rows } = await pool.query(
      `update procedimentos
       set nome = $1, descricao = $2, duracao_min = $3, preco = $4, ativo = $5
       where id = $6
       returning *`,
      [p.nome, p.descricao || null, p.duracao_min, p.preco, p.ativo ?? true, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Procedimento não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

procedimentosRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('delete from procedimentos where id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
