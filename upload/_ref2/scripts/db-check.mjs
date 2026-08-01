import { Client } from "pg"

const c = new Client({ connectionString: process.env.DATABASE_URL })
await c.connect()
const r = await c.query(
  "select table_schema, table_name from information_schema.tables where table_schema in ('public') order by 1,2",
)
console.log(r.rows.map((x) => `${x.table_schema}.${x.table_name}`).join("\n") || "(no public tables)")
await c.end()
