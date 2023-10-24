import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';

import { RunTenantMigrations } from './run-tenant-migrations.command';

@Module({
  imports: [TenantMigrationModule],
  providers: [RunTenantMigrations],
})
export class MetadataCommandModule {}
