import { Module } from '@nestjs/common';

import { ViewCacheModule } from 'src/engine/core-modules/view/cache/services/view-cache.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';
import { WorkspaceMigrationBuilderV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.module';
import { WorkspaceMigrationRunnerV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.module';

@Module({
  imports: [
    WorkspaceMigrationBuilderV2Module,
    WorkspaceMigrationRunnerV2Module,
    WorkspaceMetadataCacheModule,
    ViewCacheModule,
  ],
  providers: [
    WorkspaceMigrationV2ViewActionsBuilderService,
    FlatViewValidatorService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    FlatViewFieldValidatorService,
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
  exports: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
})
export class WorkspaceMigrationV2Module {}
