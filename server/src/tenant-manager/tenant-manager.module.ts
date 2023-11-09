import { Module } from '@nestjs/common';

import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantDataSourceModule } from 'src/tenant-datasource/tenant-datasource.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';

import { TenantManagerService } from './tenant-manager.service';

@Module({
  imports: [
    TenantDataSourceModule,
    TenantMigrationModule,
    TenantMigrationRunnerModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceMetadataModule,
  ],
  exports: [TenantManagerService],
  providers: [TenantManagerService],
})
export class TenantManagerModule {}
