import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceMigrationService } from './workspace-migration.service';
import { WorkspaceMigrationEntity } from './workspace-migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMigrationEntity], 'metadata')],
  exports: [WorkspaceMigrationService],
  providers: [WorkspaceMigrationService],
})
export class WorkspaceMigrationModule {}
