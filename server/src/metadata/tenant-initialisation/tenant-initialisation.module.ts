import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';

import { TenantInitialisationService } from './tenant-initialisation.service';

@Module({
  imports: [
    DataSourceModule,
    TenantMigrationModule,
    MigrationRunnerModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceMetadataModule,
  ],
  exports: [TenantInitialisationService],
  providers: [TenantInitialisationService],
})
export class TenantInitialisationModule {}
