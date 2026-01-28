import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { FlatCacheInvalidateCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/flat-cache-invalidate.command';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Module({
  imports: [
    FeatureFlagModule,
    TypeORMModule,
    DataSourceModule,
    WorkspaceMetadataVersionModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    DiscoveryModule,
    WorkspaceCacheStorageModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [
    WorkspaceMigrationRunnerService,
    WorkspaceMigrationRunnerActionHandlerRegistryService,
    FlatCacheInvalidateCommand,
  ],
  exports: [WorkspaceMigrationRunnerService],
})
export class WorkspaceMigrationRunnerModule {}
