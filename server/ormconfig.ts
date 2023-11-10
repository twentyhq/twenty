import dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
dotenv.config();

export default {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  entities: [__dirname + '/src/coreV2/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: __dirname + '/migrations',
  },
} as PostgresConnectionOptions;
