import pg from 'pg'
import 'dotenv/config'

const { Pool, types } = pg

// O driver "pg" por padrão converte colunas DATE em objetos Date (e depois
// em timestamp completo no JSON). O frontend espera "YYYY-MM-DD" puro
// (era o formato que o PostgREST do Supabase retornava), então mantemos
// o valor cru de texto vindo do Postgres em vez de deixar o pg convertê-lo.
types.setTypeParser(types.builtins.DATE, (value) => value)

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    'DATABASE_URL não configurada. Copie server/.env.example para server/.env e preencha com os dados do seu banco Postgres.'
  )
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
