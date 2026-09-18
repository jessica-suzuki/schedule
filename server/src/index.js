import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { authRouter } from './routes/auth.js'
import { clientesRouter } from './routes/clientes.js'
import { procedimentosRouter } from './routes/procedimentos.js'
import { agendamentosRouter } from './routes/agendamentos.js'
import { requireAuth } from './middleware/auth.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/clientes', requireAuth, clientesRouter)
app.use('/api/procedimentos', requireAuth, procedimentosRouter)
app.use('/api/agendamentos', requireAuth, agendamentosRouter)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`)
})
