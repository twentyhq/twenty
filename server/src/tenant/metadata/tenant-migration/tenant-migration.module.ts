import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { TenantMigrationService } from './tenant-migration.service';

@Module({
  imports: [DataSourceModule],
  exports: [TenantMigrationService],
  providers: [TenantMigrationService],
})
export class TenantMigrationModule {}
