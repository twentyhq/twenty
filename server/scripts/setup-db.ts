import console from 'console';

import { connectionSource, performQuery } from './utils';

connectionSource
  .initialize()
  .then(async () => {
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "public"',
      'create schema "public"',
    );
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
