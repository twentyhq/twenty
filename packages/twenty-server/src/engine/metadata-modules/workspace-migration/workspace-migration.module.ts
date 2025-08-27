import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { workspaceColumnActionFactories } from 'src/engine/metadata-modules/workspace-migration/factories/factories';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';

import { WorkspaceMigrationEntity } from './workspace-migration.entity';
import { WorkspaceMigrationService } from './workspace-migration.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMigrationEntity])],
  providers: [
    ...workspaceColumnActionFactories,
    WorkspaceMigrationFactory,
    WorkspaceMigrationService,
  ],
  exports: [
    ...workspaceColumnActionFactories,
    WorkspaceMigrationFactory,
    WorkspaceMigrationService,
  ],
})
export class WorkspaceMigrationModule {}
