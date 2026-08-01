import { readFileSync } from "node:fs"
import { Client } from "pg"

const file = process.argv[2]
if (!file) throw new Error("usage: node scripts/run-sql.mjs <file.sql>")

const c = new Client({ connectionString: process.env.DATABASE_URL })
await c.connect()
await c.query(readFileSync(file, "utf8"))
const r = await c.query(
  "select table_name from information_schema.tables where table_schema='public' order by 1",
)
console.log("public tables:", r.rows.map((x) => x.table_name).join(", "))
await c.end()
