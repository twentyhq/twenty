import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataService } from 'src/workspace/workspace-sync-metadata/workspace-sync-metadata.service';
import { workspaceSyncMetadataFactories } from 'src/workspace/workspace-sync-metadata/factories';
import { workspaceSyncMetadataComparators } from 'src/workspace/workspace-sync-metadata/comparators';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncObjectMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';
import { WorkspaceMigrationBuilderModule } from 'src/workspace/workspace-migration-builder/workspace-migration-builder.module';

@Module({
  imports: [
    WorkspaceMigrationBuilderModule,
    WorkspaceMigrationRunnerModule,
    TypeOrmModule.forFeature(
      [
        FieldMetadataEntity,
        ObjectMetadataEntity,
        RelationMetadataEntity,
        WorkspaceMigrationEntity,
      ],
      'metadata',
    ),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [
    ...workspaceSyncMetadataFactories,
    ...workspaceSyncMetadataComparators,
    WorkspaceMetadataUpdaterService,
    WorkspaceSyncObjectMetadataService,
    WorkspaceSyncRelationMetadataService,
    WorkspaceSyncMetadataService,
  ],
  exports: [WorkspaceSyncMetadataService],
})
export class WorkspaceSyncMetadataModule {}
