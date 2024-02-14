import { Config } from 'drizzle-kit';

import 'dotenv/config';

const sqliteConfig = {
  schema: './src/database/sqlite/schema-sqlite.ts',
  out: './src/database/sqlite/migrations',
  driver: 'libsql',
  dbCredentials: {
    url: 'twenty-website.sqlite',
  },
} satisfies Config;

export default sqliteConfig;
