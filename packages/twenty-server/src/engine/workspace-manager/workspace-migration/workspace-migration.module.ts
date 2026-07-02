import { Module } from '@nestjs/common';

import { MetadataSideEffectModule } from 'src/engine/metadata-modules/metadata-side-effect/metadata-side-effect.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationFlatEntityMapsService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-flat-entity-maps.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationBuilderModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    WorkspaceMigrationBuilderModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceCacheModule,
    MetadataSideEffectModule,
  ],
  providers: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
    WorkspaceMigrationFlatEntityMapsService,
  ],
  exports: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
})
export class WorkspaceMigrationModule {}
