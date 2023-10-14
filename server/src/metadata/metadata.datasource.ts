import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { InitMetadataTables1695214465080 } from './migrations/1695214465080-InitMetadataTables';
import { AlterFieldMetadataTable1695717691800 } from './migrations/1695717691800-alter-field-metadata-table';
import { AddTargetColumnMap1696409050890 } from './migrations/1696409050890-add-target-column-map';
import { MetadataNameLabelRefactoring1697126636202 } from './migrations/1697126636202-MetadataNameLabelRefactoring';

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
  migrations: [
    InitMetadataTables1695214465080,
    AlterFieldMetadataTable1695717691800,
    AddTargetColumnMap1696409050890,
    MetadataNameLabelRefactoring1697126636202,
  ],
};

export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
