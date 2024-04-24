import { Config } from 'drizzle-kit';

import 'dotenv/config';

const pgConfig = {
  schema: './src/database/postgres/schema-postgres.ts',
  out: './src/database/postgres/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_PG_URL ?? '',
  },
} satisfies Config;

export default pgConfig;
