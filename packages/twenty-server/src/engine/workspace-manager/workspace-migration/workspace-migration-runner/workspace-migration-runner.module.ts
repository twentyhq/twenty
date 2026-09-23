import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { FlatCacheInvalidateCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/flat-cache-invalidate.command';
import { RetryFailedDeferredWorkspaceMigrationActionsCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/retry-failed-deferred-workspace-migration-actions.command';
import { DeferredWorkspaceMigrationActionRecoveryCronCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/crons/commands/deferred-workspace-migration-action-recovery.cron.command';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { DeferredWorkspaceMigrationActionRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-recovery.service';
import { DeferredWorkspaceMigrationActionGaugeService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-gauge.service';
import { DeferredWorkspaceMigrationActionRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-runner.service';
import { WorkspaceSchemaMigrationLockService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-schema-migration-lock.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Module({
  imports: [
    FeatureFlagModule,
    TypeORMModule,
    WorkspaceMetadataVersionModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    DiscoveryModule,
    WorkspaceCacheStorageModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      DeferredWorkspaceMigrationActionEntity,
    ]),
    WorkspaceIteratorModule,
    MetricsModule,
  ],
  providers: [
    WorkspaceMigrationRunnerService,
    WorkspaceMigrationRunnerActionHandlerRegistryService,
    DeferredWorkspaceMigrationActionRunnerService,
    DeferredWorkspaceMigrationActionRecoveryService,
    WorkspaceSchemaMigrationLockService,
    provideWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity),
    DeferredWorkspaceMigrationActionGaugeService,
    FlatCacheInvalidateCommand,
    RetryFailedDeferredWorkspaceMigrationActionsCommand,
    DeferredWorkspaceMigrationActionRecoveryCronCommand,
  ],
  exports: [
    WorkspaceMigrationRunnerService,
    DeferredWorkspaceMigrationActionRunnerService,
    DeferredWorkspaceMigrationActionRecoveryService,
    DeferredWorkspaceMigrationActionRecoveryCronCommand,
  ],
})
export class WorkspaceMigrationRunnerModule {}
