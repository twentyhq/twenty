import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MetadataSideEffectModule } from 'src/engine/metadata-modules/metadata-side-effect/metadata-side-effect.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationFlatEntityMapsService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-flat-entity-maps.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationBuilderModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKeyEntity, WorkspaceEntity]),
    WorkspaceMigrationBuilderModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceCacheModule,
    MetadataSideEffectModule,
    MetricsModule,
  ],
  providers: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
    WorkspaceMigrationFlatEntityMapsService,
    provideWorkspaceScopedRepository(ApiKeyEntity),
  ],
  exports: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
})
export class WorkspaceMigrationModule {}
