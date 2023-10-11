import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';

import { MigrationRunnerService } from './migration-runner.service';

@Module({
  imports: [DataSourceModule, TenantMigrationModule],
  exports: [MigrationRunnerService],
  providers: [MigrationRunnerService],
})
export class MigrationRunnerModule {}
