import { createClient } from '@libsql/client';
import { drizzle as sqliteDrizzle } from 'drizzle-orm/libsql';
import { migrate as sqliteMigrate } from 'drizzle-orm/libsql/migrator';
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js';
import { migrate as postgresMigrate } from 'drizzle-orm/postgres-js/migrator';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import postgres from 'postgres';

import 'dotenv/config';

// Todo: Deprecate SQLite once prototyping is complete, this is making things impossible to type properly
const databaseDriver = process.env.DATABASE_DRIVER;

const sqliteClient = createClient({
  url: 'file:twenty-website.sqlite',
});
const pgClient = postgres(`${process.env.DATABASE_PG_URL}`);
const sqliteDb = sqliteDrizzle(sqliteClient, { logger: true });
const pgDb = pgDrizzle(pgClient, { logger: true });

const isSqliteDriver = databaseDriver === 'sqlite';

const migrate = async () => {
  if (isSqliteDriver) {
    await sqliteMigrate(sqliteDb, {
      migrationsFolder: './src/database/sqlite/migrations',
    });
  } else {
    await postgresMigrate(pgDb, {
      migrationsFolder: './src/database/postgres/migrations',
    });
  }
};

const findAll = (model: SQLiteTableWithColumns<any>) => {
  return isSqliteDriver
    ? sqliteDb.select().from(model).all()
    : pgDb.select().from(model).execute();
};

// Todo: rework typing
const insertMany = async (
  model: SQLiteTableWithColumns<any>,
  data: any,
  options?: { onConflictKey?: string },
) => {
  if (isSqliteDriver) {
    const query = sqliteDb.insert(model).values(data);
    if (options?.onConflictKey) {
      return query
        .onConflictDoNothing({
          target: [model[options.onConflictKey]],
        })
        .execute();
    }
    return query.execute();
  }
  const query = pgDb.insert(model).values(data);
  if (options?.onConflictKey) {
    return query
      .onConflictDoNothing({
        target: [model[options.onConflictKey]],
      })
      .execute();
  }

  return query.execute();
};

export { findAll, insertMany, migrate };
