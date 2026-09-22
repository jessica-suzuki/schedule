import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { enviarEmail, emailRedefinirSenha } from '../email.js'

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Hash bcrypt de uma senha aleatória qualquer — nunca corresponde a uma
// senha real. Usado só para gastar o mesmo tempo de CPU que um
// bcrypt.compare de verdade quando o e-mail não existe, para a resposta
// do login não revelar (por tempo de resposta) quais e-mails têm conta.
const SENHA_HASH_FICTICIO =
  '$2b$10$o69N0UA7gbzzPppdhImkJelNXqIepQUeR9QcoZPFMK0XrH8uT1.Z.'

// Limita tentativas de login por IP para dificultar força bruta de senha.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
})

// Mais permissivo que o de login (é usado por gente que genuinamente
// esqueceu a senha), mas ainda limita spam de e-mail / varredura de contas.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
})

export const authRouter = Router()

authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, senha } = req.body ?? {}
    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
    }

    const { rows } = await pool.query(
      'select id, nome, email, senha_hash from usuarios where email = $1',
      [String(email).toLowerCase().trim()]
    )
    const usuario = rows[0]

    // Roda o bcrypt.compare mesmo quando o e-mail não existe (contra um
    // hash fictício), para o tempo de resposta ser igual nos dois casos —
    // ver SENHA_HASH_FICTICIO acima.
    const senhaValida = await bcrypt.compare(senha, usuario?.senha_hash ?? SENHA_HASH_FICTICIO)

    if (!usuario || !senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ usuario: req.usuario })
})

// Sempre responde com sucesso genérico, mesmo se o e-mail não existir —
// assim ninguém consegue descobrir quais e-mails têm conta só tentando aqui.
authRouter.post('/forgot-password', forgotPasswordLimiter, async (req, res, next) => {
  try {
    const { email } = req.body ?? {}
    if (!email) {
      return res.status(400).json({ error: 'Informe o e-mail.' })
    }

    const { rows } = await pool.query('select id from usuarios where email = $1', [
      String(email).toLowerCase().trim(),
    ])
    const usuario = rows[0]

    if (usuario) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      await pool.query(
        'insert into password_reset_tokens (usuario_id, token_hash, expires_at) values ($1, $2, $3)',
        [usuario.id, hashToken(token), expiresAt]
      )

      const baseUrl = process.env.RESET_URL_BASE || 'http://localhost:5173/admin/redefinir-senha'
      const link = `${baseUrl}?token=${token}`

      // eslint-disable-next-line no-console
      console.log(`Link de redefinição de senha (${email}): ${link}`)

      const { subject, html } = emailRedefinirSenha(link)
      try {
        await enviarEmail({ to: email, subject, html })
      } catch (emailErr) {
        // Não deixamos a falha de envio (ex.: domínio não verificado no
        // Resend) virar um 500 nem revelar se o e-mail existe — só logamos
        // para alguém da equipe técnica notar e resolver.
        // eslint-disable-next-line no-console
        console.error('Falha ao enviar e-mail de redefinição:', emailErr)
      }
    }

    res.json({ ok: true, mensagem: 'Se esse e-mail estiver cadastrado, enviamos um link de redefinição.' })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { token, senha } = req.body ?? {}
    if (!token || !senha) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' })
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' })
    }

    const { rows } = await pool.query(
      `select id, usuario_id, expires_at, used_at
       from password_reset_tokens
       where token_hash = $1`,
      [hashToken(token)]
    )
    const registro = rows[0]

    if (!registro || registro.used_at || new Date(registro.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo.' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    await pool.query('update usuarios set senha_hash = $1 where id = $2', [
      senhaHash,
      registro.usuario_id,
    ])
    await pool.query('update password_reset_tokens set used_at = now() where id = $1', [
      registro.id,
    ])

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
