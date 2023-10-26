import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';

import { RunTenantMigrations } from './run-tenant-migrations.command';

@Module({
  imports: [TenantMigrationModule, MigrationRunnerModule],
  providers: [RunTenantMigrations],
})
export class MetadataCommandModule {}
