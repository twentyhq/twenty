import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const typeORMMetadataModuleOptions: TypeOrmModuleOptions = {
  url: configService.get<string>('PG_DATABASE_URL'),
  type: 'postgres',
  logging: false,
  schema: 'metadata',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  migrationsTableName: '_typeorm_migrations',
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
