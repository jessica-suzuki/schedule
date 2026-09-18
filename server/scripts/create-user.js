// Cria (ou atualiza a senha de) um usuário de acesso ao painel.
// Substitui o antigo fluxo "criar usuário no painel do Supabase".
//
// Uso:
//   npm run create-user -- "Nome da pessoa" email@exemplo.com "senha-forte"

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from '../src/db.js'

async function main() {
  const [nome, email, senha] = process.argv.slice(2)
  if (!nome || !email || !senha) {
    console.error('Uso: npm run create-user -- "Nome" email@exemplo.com senha')
    process.exit(1)
  }

  const senhaHash = await bcrypt.hash(senha, 10)

  await pool.query(
    `insert into usuarios (nome, email, senha_hash)
     values ($1, $2, $3)
     on conflict (email) do update set nome = excluded.nome, senha_hash = excluded.senha_hash`,
    [nome, email.toLowerCase().trim(), senhaHash]
  )

  console.log(`Usuário "${email}" criado/atualizado com sucesso.`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
