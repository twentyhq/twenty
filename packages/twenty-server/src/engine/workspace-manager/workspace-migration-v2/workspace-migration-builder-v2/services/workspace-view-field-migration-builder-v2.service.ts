import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation.type';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { WorkspaceMigrationOrchestratorOptimisticEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import {
  FailedEntityMigrationBuildResult,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationViewFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export type WorkspaceViewFieldMigrationV2BuilderOptions = {
  isSystemBuild: boolean;
  inferDeletionFromMissingEntities: boolean;
};

export type FailedWorkspaceViewFieldMigrationBuildResult =
  FailedEntityMigrationBuildResult<FailedFlatViewFieldValidation>;

export type WorkspaceViewFieldMigrationBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceViewFieldMigrationV2BuilderOptions;
  dependencyOptimisticEntityMaps: WorkspaceMigrationOrchestratorOptimisticEntityMaps;
} & FromTo<FlatViewFieldMaps, 'FlatViewFieldMaps'>;

@Injectable()
export class WorkspaceViewFieldMigrationBuilderV2Service extends WorkspaceEntityMigrationBuilderV2Service<
  FlatViewFieldMaps,
  FlatViewField,
  FailedFlatViewFieldValidation,
  WorkspaceMigrationViewFieldActionV2,
  WorkspaceViewFieldMigrationBuildArgs
> {
  constructor(
    private readonly workspaceMigrationV2ViewFieldActionsBuilderService: WorkspaceMigrationV2ViewFieldActionsBuilderService,
  ) {
    super();
  }

  protected async validateAndBuildActions(
    args: WorkspaceViewFieldMigrationBuildArgs & {
      created: FlatViewField[];
      updated: { from: FlatViewField; to: FlatViewField }[];
      deleted: FlatViewField[];
    },
  ): Promise<{
    failed: FailedFlatViewFieldValidation[];
    created: WorkspaceMigrationViewFieldActionV2[];
    deleted: WorkspaceMigrationViewFieldActionV2[];
    updated: WorkspaceMigrationViewFieldActionV2[];
    optimisticMaps: FlatViewFieldMaps;
  }> {
    const viewFieldActionsValidateAndBuildResult =
      await this.workspaceMigrationV2ViewFieldActionsBuilderService.validateAndBuildViewFieldActions(
        {
          fromFlatViewFieldMaps: args.fromFlatViewFieldMaps,
          toFlatViewFieldMaps: args.toFlatViewFieldMaps,
          createdFlatViewField: args.created,
          updatedFlatViewField: args.updated,
          deletedFlatViewField: args.deleted,
          buildOptions: args.buildOptions,
          dependencyOptimisticEntityMaps: args.dependencyOptimisticEntityMaps,
        },
      );

    return {
      failed: viewFieldActionsValidateAndBuildResult.failed,
      created: viewFieldActionsValidateAndBuildResult.created,
      deleted: viewFieldActionsValidateAndBuildResult.deleted,
      updated: viewFieldActionsValidateAndBuildResult.updated,
      optimisticMaps:
        viewFieldActionsValidateAndBuildResult.optimisticFlatViewFieldMaps,
    };
  }
}
