import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantMigrationEntity } from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

import { TenantMigrationService } from './tenant-migration.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMigrationEntity], 'metadata')],
  exports: [TenantMigrationService],
  providers: [TenantMigrationService],
})
export class TenantMigrationModule {}
