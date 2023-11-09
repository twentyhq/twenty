import { Module } from '@nestjs/common';

import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';

import { RunTenantMigrationsCommand } from './run-tenant-migrations.command';

@Module({
  imports: [TenantMigrationModule, TenantMigrationRunnerModule],
  providers: [RunTenantMigrationsCommand],
})
export class TenantMigrationRunnerCommandsModule {}
