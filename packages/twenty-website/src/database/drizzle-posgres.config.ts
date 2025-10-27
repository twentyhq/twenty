import "dotenv/config";
import { type Config } from "drizzle-kit";

const dbUrl = new URL(process.env.DATABASE_PG_URL!);

export default {
  schema: "./src/database/schema-postgres.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
  },
} satisfies Config;
