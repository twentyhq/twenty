import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/registry/workspace-migration-runner-action-handler-registry.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/services/workspace-migration-runner-v2.service';

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
  ],
  providers: [
    WorkspaceMigrationRunnerV2Service,
    WorkspaceMigrationRunnerActionHandlerRegistryService,
  ],
  exports: [WorkspaceMigrationRunnerV2Service],
})
export class WorkspaceMigrationRunnerV2Module {}
