import { global } from '@apollo/client/utilities/globals';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate as postgresMigrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import 'dotenv/config';

let pgDb: PostgresJsDatabase;

if (global.process.env.DATABASE_PG_URL) {
  const pgClient = postgres(`${global.process.env.DATABASE_PG_URL}`);
  pgDb = drizzle(pgClient, { logger: false });
}

const migrate = async () => {
  await postgresMigrate(pgDb, {
    migrationsFolder: './src/database/migrations',
  });
};

const findOne = (model: any, orderBy: any) => {
  return pgDb.select().from(model).orderBy(orderBy).limit(1).execute();
};

const findAll = (model: any, orderBy?: any) => {
  if (orderBy) {
    return pgDb.select().from(model).orderBy(orderBy).execute();
  }
  return pgDb.select().from(model).execute();
};

const insertMany = async (
  model: any,
  data: any,
  options?: {
    onConflictKey?: string;
    onConflictUpdateObject?: any;
    onConflictDoNothing?: boolean;
  },
) => {
  const query = pgDb.insert(model).values(data);

  if (options?.onConflictUpdateObject) {
    if (options?.onConflictKey) {
      return query
        .onConflictDoUpdate({
          target: [model[options.onConflictKey]],
          set: options.onConflictUpdateObject,
        })
        .execute();
    }
  }

  if (options?.onConflictDoNothing && !options?.onConflictKey) {
    return query.onConflictDoNothing().execute();
  }

  if (options?.onConflictKey) {
    return query
      .onConflictDoNothing({
        target: [model[options.onConflictKey]],
      })
      .execute();
  }
  return query.execute();
};

export { findAll, findOne, insertMany, migrate };
