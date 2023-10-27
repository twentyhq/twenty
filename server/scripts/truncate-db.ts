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
      `
        CREATE OR REPLACE FUNCTION drop_all() RETURNS VOID AS $$
          DECLARE schema_item RECORD; 
          BEGIN
            FOR schema_item IN
              SELECT subrequest."name" as schema_name
              FROM  (SELECT n.nspname AS "name"
              FROM pg_catalog.pg_namespace n
              WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema') as subrequest
            LOOP
              EXECUTE 'DROP SCHEMA ' || schema_item.schema_name || ' CASCADE'; 
            END LOOP; 
            RETURN; 
          END;
        $$ LANGUAGE plpgsql;
     
        SELECT drop_all ();
      `,
      'Dropping all schemas...',
    );
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
