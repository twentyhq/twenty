import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { workspaceColumnActionFactories } from 'src/metadata/workspace-migration/factories/factories';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

import { WorkspaceMigrationService } from './workspace-migration.service';
import { WorkspaceMigrationEntity } from './workspace-migration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [WorkspaceMigrationEntity, ObjectMetadataEntity],
      'metadata',
    ),
  ],
  providers: [
    ...workspaceColumnActionFactories,
    WorkspaceMigrationFactory,
    WorkspaceMigrationService,
  ],
  exports: [WorkspaceMigrationFactory, WorkspaceMigrationService],
})
export class WorkspaceMigrationModule {}
