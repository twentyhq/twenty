import { ConfigService } from '@nestjs/config';

import console from 'console';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export const connectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: configService.get<string>('PG_DATABASE_URL'),
});

const performQuery = async (query: string, consoleDescription: string) => {
  try {
    await connectionSource.query(query);
    console.log(`Performed '${consoleDescription}' successfully`);
  } catch (err) {
    console.error(`Failed to perform '${consoleDescription}':`, err);
  }
};

connectionSource
  .initialize()
  .then(async () => {
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "metadata"',
      'create schema "metadata"',
    );
    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS pg_graphql',
      'create extension pg_graphql',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      'create extension "uuid-ossp"',
    );

    await performQuery(
      `COMMENT ON SCHEMA "public" IS '@graphql({"inflect_names": true})';`,
      'inflect names for graphql',
    );

    await performQuery(
      `
      DROP FUNCTION IF EXISTS graphql;
      CREATE FUNCTION graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
      )
        returns jsonb
        language sql
        as $$
          select graphql.resolve(
              query := query,
              variables := coalesce(variables, '{}'),
              "operationName" := "operationName",
              extensions := extensions
          );
        $$;
    `,
      'create function graphql',
    );
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
