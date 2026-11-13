import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { FlatCacheInvalidateCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/flat-cache-invalidate.command';
import { RetryFailedDeferredWorkspaceOperationsCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/retry-failed-deferred-workspace-operations.command';
import { DeferredWorkspaceOperationRecoveryCronCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/crons/commands/deferred-workspace-operation-recovery.cron.command';
import { DeferredWorkspaceOperationHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/deferred-workspace-operation-handler-registry.service';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { DeferredWorkspaceOperationRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-recovery.service';
import { DeferredWorkspaceOperationGaugeService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-gauge.service';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { InFlightDeferredWorkspaceOperationsService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/in-flight-deferred-workspace-operations.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Module({
  imports: [
    FeatureFlagModule,
    WorkspaceMetadataVersionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    DiscoveryModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([DeferredWorkspaceOperationEntity]),
    WorkspaceIteratorModule,
    MetricsModule,
  ],
  providers: [
    WorkspaceMigrationRunnerService,
    WorkspaceMigrationRunnerActionHandlerRegistryService,
    DeferredWorkspaceOperationHandlerRegistryService,
    DeferredWorkspaceOperationRunnerService,
    DeferredWorkspaceOperationRecoveryService,
    InFlightDeferredWorkspaceOperationsService,
    provideWorkspaceScopedRepository(DeferredWorkspaceOperationEntity),
    DeferredWorkspaceOperationGaugeService,
    FlatCacheInvalidateCommand,
    RetryFailedDeferredWorkspaceOperationsCommand,
    DeferredWorkspaceOperationRecoveryCronCommand,
  ],
  exports: [
    WorkspaceMigrationRunnerService,
    DeferredWorkspaceOperationRunnerService,
    DeferredWorkspaceOperationRecoveryService,
    DeferredWorkspaceOperationRecoveryCronCommand,
  ],
})
export class WorkspaceMigrationRunnerModule {}
