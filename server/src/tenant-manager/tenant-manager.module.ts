import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';
import { TenantDataSourceModule } from 'src/tenant-datasource/tenant-datasource.module';
import { RelationMetadataModule } from 'src/metadata/relation-metadata/relation-metadata.module';

import { TenantManagerService } from './tenant-manager.service';

@Module({
  imports: [
    TenantDataSourceModule,
    TenantMigrationModule,
    TenantMigrationRunnerModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
    RelationMetadataModule,
  ],
  exports: [TenantManagerService],
  providers: [TenantManagerService],
})
export class TenantManagerModule {}
