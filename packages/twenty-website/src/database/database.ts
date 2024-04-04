import { global } from '@apollo/client/utilities/globals';
import { createClient } from '@libsql/client';
import { drizzle as sqliteDrizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate as sqliteMigrate } from 'drizzle-orm/libsql/migrator';
import {
  drizzle as pgDrizzle,
  PostgresJsDatabase,
} from 'drizzle-orm/postgres-js';
import { migrate as postgresMigrate } from 'drizzle-orm/postgres-js/migrator';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import postgres from 'postgres';

import 'dotenv/config';

// Todo: Deprecate SQLite once prototyping is complete, this is making things impossible to type properly
const databaseDriver = global.process.env.DATABASE_DRIVER || 'sqlite';
const isSqliteDriver = databaseDriver === 'sqlite';
const isPgDriver = databaseDriver === 'pg';

let sqliteDb: LibSQLDatabase;
let pgDb: PostgresJsDatabase;

if (isSqliteDriver) {
  const sqliteClient = createClient({
    url: 'file:twenty-website.sqlite',
  });
  sqliteDb = sqliteDrizzle(sqliteClient, { logger: false });
}

if (isPgDriver) {
  const pgClient = postgres(`${global.process.env.DATABASE_PG_URL}`);
  pgDb = pgDrizzle(pgClient, { logger: false });
}

const migrate = async () => {
  if (isSqliteDriver) {
    await sqliteMigrate(sqliteDb, {
      migrationsFolder: './src/database/sqlite/migrations',
    });
    return;
  }
  if (isPgDriver) {
    await postgresMigrate(pgDb, {
      migrationsFolder: './src/database/postgres/migrations',
    });
    return;
  }

  throw new Error('Unsupported database driver');
};

const findOne = (model: SQLiteTableWithColumns<any>, orderBy: any) => {
  if (isSqliteDriver) {
    return sqliteDb.select().from(model).orderBy(orderBy).limit(1).execute();
  }

  if (isPgDriver) {
    return pgDb.select().from(model).orderBy(orderBy).limit(1).execute();
  }

  throw new Error('Unsupported database driver');
};

const findAll = (model: SQLiteTableWithColumns<any>) => {
  if (isSqliteDriver) {
    return sqliteDb.select().from(model).all();
  }

  if (isPgDriver) {
    return pgDb.select().from(model).execute();
  }

  throw new Error('Unsupported database driver');
};

const insertMany = async (
  model: SQLiteTableWithColumns<any>,
  data: any,
  options?: {
    onConflictKey?: string;
    onConflictUpdateObject?: any;
  },
) => {
  if (isSqliteDriver) {
    const query = sqliteDb.insert(model).values(data);

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

    if (options?.onConflictKey) {
      return query
        .onConflictDoNothing({
          target: [model[options.onConflictKey]],
        })
        .execute();
    }

    return query.execute();
  }
  if (isPgDriver) {
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

    if (options?.onConflictKey) {
      return query
        .onConflictDoNothing({
          target: [model[options.onConflictKey]],
        })
        .execute();
    }
    return query.execute();
  }

  throw new Error('Unsupported database driver');
};

export { findAll, findOne, insertMany, migrate };
