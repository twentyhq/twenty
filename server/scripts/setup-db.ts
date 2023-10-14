import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export const connectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: configService.get<string>('PG_DATABASE_URL'),
});

connectionSource
  .initialize()
  .then(async () => {
    await connectionSource.query(`CREATE SCHEMA IF NOT EXISTS "metadata"`);
    const result = await connectionSource.query(`
     SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'metadata'
    `);
    if (result.length > 0) {
      console.log('Schema "metadata" created successfully');
    } else {
      console.log('Failed to create schema "metadata"');
    }
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
