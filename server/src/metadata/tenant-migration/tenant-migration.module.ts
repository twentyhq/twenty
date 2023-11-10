import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantMigrationService } from './tenant-migration.service';
import { TenantMigrationEntity } from './tenant-migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMigrationEntity], 'metadata')],
  exports: [TenantMigrationService],
  providers: [TenantMigrationService],
})
export class TenantMigrationModule {}
