import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/registry/workspace-migration-runner-action-handler-registry.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/services/workspace-migration-runner-v2.service';

@Module({
  imports: [
    FeatureFlagModule,
    TypeORMModule,
    DataSourceModule,
    WorkspaceMetadataCacheModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    DiscoveryModule,
  ],
  providers: [
    WorkspaceMigrationRunnerV2Service,
    WorkspaceMigrationRunnerActionHandlerRegistryService,
  ],
  exports: [WorkspaceMigrationRunnerV2Service],
})
export class WorkspaceMigrationRunnerV2Module {}
