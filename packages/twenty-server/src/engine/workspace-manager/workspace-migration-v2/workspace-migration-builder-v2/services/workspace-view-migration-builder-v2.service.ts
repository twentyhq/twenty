import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { FailedFlatViewValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { WorkspaceMigrationOrchestratorOptimisticEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import {
  FailedEntityMigrationBuildResult,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationViewActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';

export type WorkspaceViewMigrationV2BuilderOptions = {
  isSystemBuild: boolean;
  inferDeletionFromMissingEntities: boolean;
};

export type FailedWorkspaceViewMigrationBuildResult =
  FailedEntityMigrationBuildResult<FailedFlatViewValidation>;

export type WorkspaceViewMigrationBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceViewMigrationV2BuilderOptions;
  dependencyOptimisticEntityMaps: WorkspaceMigrationOrchestratorOptimisticEntityMaps;
} & FromTo<FlatViewMaps, 'FlatViewMaps'>;

@Injectable()
export class WorkspaceViewMigrationBuilderV2Service extends WorkspaceEntityMigrationBuilderV2Service<
  FlatViewMaps,
  FlatView,
  FailedFlatViewValidation,
  WorkspaceMigrationViewActionV2,
  WorkspaceViewMigrationBuildArgs
> {
  constructor(
    private readonly workspaceMigrationV2ViewActionsBuilderService: WorkspaceMigrationV2ViewActionsBuilderService,
  ) {
    super();
  }

  protected async validateAndBuildActions(
    args: WorkspaceViewMigrationBuildArgs & {
      created: FlatView[];
      updated: { from: FlatView; to: FlatView }[];
      deleted: FlatView[];
    },
  ): Promise<{
    failed: FailedFlatViewValidation[];
    created: WorkspaceMigrationViewActionV2[];
    deleted: WorkspaceMigrationViewActionV2[];
    updated: WorkspaceMigrationViewActionV2[];
    optimisticMaps: FlatViewMaps;
  }> {
    const viewActionsValidateAndBuildResult =
      await this.workspaceMigrationV2ViewActionsBuilderService.validateAndBuildViewActions(
        {
          fromFlatViewMaps: args.fromFlatViewMaps,
          toFlatViewMaps: args.toFlatViewMaps,
          createdFlatView: args.created,
          updatedFlatView: args.updated,
          deletedFlatView: args.deleted,
          buildOptions: args.buildOptions,
          dependencyOptimisticEntityMaps: args.dependencyOptimisticEntityMaps,
        },
      );

    return {
      failed: viewActionsValidateAndBuildResult.failed,
      created: viewActionsValidateAndBuildResult.created,
      deleted: viewActionsValidateAndBuildResult.deleted,
      updated: viewActionsValidateAndBuildResult.updated,
      optimisticMaps: viewActionsValidateAndBuildResult.optimisticFlatViewMaps,
    };
  }
}
