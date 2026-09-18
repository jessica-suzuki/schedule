// Aplica db/schema.sql e (opcionalmente) db/seed.sql no banco apontado por
// DATABASE_URL. Uso: npm run migrate  ou  npm run migrate -- --seed
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbDir = path.join(__dirname, '..', 'db')

async function main() {
  const comSeed = process.argv.includes('--seed')

  const schema = fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8')
  console.log('Aplicando schema.sql...')
  await pool.query(schema)

  if (comSeed) {
    const seed = fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf8')
    console.log('Aplicando seed.sql...')
    await pool.query(seed)
  }

  console.log('Pronto.')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
