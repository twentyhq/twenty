import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantDataSourceModule } from 'src/tenant-datasource/tenant-datasource.module';

import { TenantMigrationRunnerService } from './tenant-migration-runner.service';

@Module({
  imports: [TenantDataSourceModule, TenantMigrationModule],
  exports: [TenantMigrationRunnerService],
  providers: [TenantMigrationRunnerService],
})
export class TenantMigrationRunnerModule {}
