import { Client } from "pg";
import { setTimeout } from "timers/promises";

const N_TABLES = Number(process.env.N_TABLES) || 100;
const N_FIELDS = Number(process.env.N_FIELDS) || 26;

const client = new Client({
  connectionString: "postgres://postgres:password@127.0.0.1:5432?schema=public",
  connectionTimeoutMillis: 0,
});

const table = (n: number) => {
  if (n === 0) {
    return "X";
  }

  return String(n).padStart(Math.log10(N_TABLES) + 1, "0");
}

const fields = () => {
  const fields = new Array(N_FIELDS).fill(null).map((_, i) => {
    const field: string = String(i).padStart(Math.log10(N_FIELDS) + 1, "0");

    return `"field${field}" int`
  });

  return fields.join(",\n");
}

const createTable = (n: number) => {
  return `
    CREATE TABLE IF NOT EXISTS "public"."table${table(n)}" (
      id int PRIMARY KEY,
      ${fields()}
    )
  `;
};

async function main() {
  await setTimeout(1000);

  await client.connect();

  for (let i = 0; i < N_TABLES; i += 1) {
    await client.query(createTable(i));
  }

  console.log("DB Prepared");

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
