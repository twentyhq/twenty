import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { InitMetadataTables1695214465080 } from './migrations/1695214465080-InitMetadataTables';
import { AlterFieldMetadataTable1695717691800 } from './migrations/1695717691800-alter-field-metadata-table';
import { AddTargetColumnMap1696409050890 } from './migrations/1696409050890-add-target-column-map';
import { MetadataNameLabelRefactoring1697126636202 } from './migrations/1697126636202-MetadataNameLabelRefactoring';
import { RemoveFieldMetadataPlaceholder1697471445015 } from './migrations/1697471445015-removeFieldMetadataPlaceholder';
import { AddSoftDelete1697474804403 } from './migrations/1697474804403-addSoftDelete';
import { RemoveSingularPluralFromFieldLabelAndName1697534910933 } from './migrations/1697534910933-removeSingularPluralFromFieldLabelAndName';
import { AddNameAndIsCustomToTenantMigration1697622715467 } from './migrations/1697622715467-addNameAndIsCustomToTenantMigration';
import { AddUniqueConstraintsOnFieldObjectMetadata1697630766924 } from './migrations/1697630766924-addUniqueConstraintsOnFieldObjectMetadata';
import { RemoveMetadataSoftDelete1698328717102 } from './migrations/1698328717102-removeMetadataSoftDelete';

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
    RemoveFieldMetadataPlaceholder1697471445015,
    AddSoftDelete1697474804403,
    RemoveSingularPluralFromFieldLabelAndName1697534910933,
    AddNameAndIsCustomToTenantMigration1697622715467,
    AddUniqueConstraintsOnFieldObjectMetadata1697630766924,
    RemoveMetadataSoftDelete1698328717102,
  ],
};

export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
