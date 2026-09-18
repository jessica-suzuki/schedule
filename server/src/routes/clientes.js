import { Router } from 'express'
import { pool } from '../db.js'

export const clientesRouter = Router()

clientesRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'select * from clientes order by nome_completo asc'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

clientesRouter.post('/', async (req, res, next) => {
  try {
    const c = req.body ?? {}
    const { rows } = await pool.query(
      `insert into clientes (nome_completo, cpf, data_nasc, telefone, email)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [c.nome_completo, c.cpf, c.data_nasc || null, c.telefone, c.email || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

clientesRouter.put('/:id', async (req, res, next) => {
  try {
    const c = req.body ?? {}
    const { rows } = await pool.query(
      `update clientes
       set nome_completo = $1, cpf = $2, data_nasc = $3, telefone = $4, email = $5
       where id = $6
       returning *`,
      [c.nome_completo, c.cpf, c.data_nasc || null, c.telefone, c.email || null, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

clientesRouter.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('delete from clientes where id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
