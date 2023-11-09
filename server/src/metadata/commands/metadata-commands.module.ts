import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

import { SyncTenantMetadataCommand } from './sync-tenant-metadata.command';
import { DataSeedTenantCommand } from './data-seed-tenant.command';

@Module({
  imports: [
    TenantMigrationModule,
    TenantMigrationRunnerModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceMetadataModule,
    TenantManagerModule,
    TypeORMModule,
  ],
  providers: [SyncTenantMetadataCommand, DataSeedTenantCommand],
})
export class MetadataCommandsModule {}
