import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationBuilderModule } from 'src/engine/workspace-manager/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { workspaceSyncMetadataComparators } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators';
import { workspaceSyncMetadataFactories } from 'src/engine/workspace-manager/workspace-sync-metadata/factories';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncFieldMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata.service';
import { WorkspaceSyncIndexMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-index-metadata.service';
import { WorkspaceSyncObjectMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';
import { ServerlessModule } from 'src/engine/integrations/serverless/serverless.module';
import { serverlessModuleFactory } from 'src/engine/integrations/serverless/serverless-module.factory';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

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
    WorkspaceCacheVersionModule,
    ServerlessModule.forRootAsync({
      useFactory: serverlessModuleFactory,
      inject: [EnvironmentService, FileStorageService, FileUploadService],
    }),
  ],
  providers: [
    ...workspaceSyncMetadataFactories,
    ...workspaceSyncMetadataComparators,
    WorkspaceMetadataUpdaterService,
    WorkspaceSyncObjectMetadataService,
    WorkspaceSyncRelationMetadataService,
    WorkspaceSyncFieldMetadataService,
    WorkspaceSyncMetadataService,
    WorkspaceSyncIndexMetadataService,
  ],
  exports: [...workspaceSyncMetadataFactories, WorkspaceSyncMetadataService],
})
export class WorkspaceSyncMetadataModule {}
