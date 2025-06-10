import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationBuilderModule } from 'src/engine/workspace-manager/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { SyncWorkspaceLoggerService } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.service';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { workspaceSyncMetadataComparators } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators';
import { workspaceSyncMetadataFactories } from 'src/engine/workspace-manager/workspace-sync-metadata/factories';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncFieldMetadataRelationService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata-relation.service';
import { WorkspaceSyncFieldMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata.service';
import { WorkspaceSyncIndexMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-index-metadata.service';
import { WorkspaceSyncObjectMetadataIdentifiersService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata-identifiers.service';
import { WorkspaceSyncObjectMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Module({
  imports: [
    FeatureFlagModule,
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
    DataSourceModule,
    TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    ...workspaceSyncMetadataFactories,
    ...workspaceSyncMetadataComparators,
    WorkspaceMetadataUpdaterService,
    WorkspaceSyncObjectMetadataService,
    WorkspaceSyncObjectMetadataIdentifiersService,
    WorkspaceSyncRelationMetadataService,
    WorkspaceSyncFieldMetadataService,
    WorkspaceSyncFieldMetadataRelationService,
    WorkspaceSyncMetadataService,
    WorkspaceSyncIndexMetadataService,
    SyncWorkspaceLoggerService,
    SyncWorkspaceMetadataCommand,
  ],
  exports: [
    ...workspaceSyncMetadataFactories,
    WorkspaceSyncMetadataService,
    SyncWorkspaceMetadataCommand,
  ],
})
export class WorkspaceSyncMetadataModule {}
