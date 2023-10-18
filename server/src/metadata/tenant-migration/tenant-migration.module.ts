import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantMigrationService } from './tenant-migration.service';
import { TenantMigration } from './tenant-migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMigration], 'metadata')],
  exports: [TenantMigrationService],
  providers: [TenantMigrationService],
})
export class TenantMigrationModule {}
