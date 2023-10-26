import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';
import { TenantInitialisationModule } from 'src/metadata/tenant-initialisation/tenant-initialisation.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';

import { SyncTenantMetadataCommand } from './sync-tenant-metadata.command';
import { RunTenantMigrationsCommand } from './run-tenant-migrations.command';

@Module({
  imports: [
    TenantMigrationModule,
    MigrationRunnerModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceMetadataModule,
    TenantInitialisationModule,
  ],
  providers: [RunTenantMigrationsCommand, SyncTenantMetadataCommand],
})
export class MetadataCommandModule {}
