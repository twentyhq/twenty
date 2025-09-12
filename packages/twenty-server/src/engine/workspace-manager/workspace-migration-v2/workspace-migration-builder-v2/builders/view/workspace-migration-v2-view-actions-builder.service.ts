import { Injectable } from '@nestjs/common';

import { FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FailedFlatViewValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { compareTwoFlatView } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view.util';
import { WorkspaceMigrationOrchestratorOptimisticEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceViewMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-view-migration-builder-v2.service';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import {
  UpdateViewAction,
  WorkspaceMigrationViewActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import {
  getWorkspaceMigrationV2ViewCreateAction,
  getWorkspaceMigrationV2ViewDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-view-action';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

export type CreatedDeletedUpdatedViewInputMatrix = FromTo<
  FlatViewMaps,
  'FlatViewMaps'
> &
  CustomDeletedCreatedUpdatedMatrix<'flatView', FlatView> & {
    buildOptions: WorkspaceViewMigrationV2BuilderOptions;
    fromFlatViewMaps: FlatViewMaps;
    dependencyOptimisticEntityMaps: WorkspaceMigrationOrchestratorOptimisticEntityMaps;
  };

type ValidateAndBuildViewResult<T extends WorkspaceMigrationActionV2> = {
  failed: FailedFlatViewValidation[];
  created: T[];
  deleted: T[];
  updated: T[];
  optimisticFlatViewMaps: FlatViewMaps;
};

@Injectable()
export class WorkspaceMigrationV2ViewActionsBuilderService {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {}

  public async validateAndBuildViewActions({
    createdFlatView,
    deletedFlatView,
    updatedFlatView,
    buildOptions,
    fromFlatViewMaps,
    dependencyOptimisticEntityMaps,
  }: CreatedDeletedUpdatedViewInputMatrix): Promise<
    ValidateAndBuildViewResult<WorkspaceMigrationViewActionV2>
  > {
    const validateAndBuildResult: ValidateAndBuildViewResult<WorkspaceMigrationViewActionV2> =
      {
        failed: [],
        created: [],
        deleted: [],
        updated: [],
        optimisticFlatViewMaps: structuredClone(fromFlatViewMaps),
      };

    if (!isDefined(dependencyOptimisticEntityMaps.object)) {
      throw new Error('Dependency optimistic entity maps are not defined');
    }

    for (const flatViewToCreate of createdFlatView) {
      const validationErrors =
        await this.flatViewValidatorService.validateFlatViewCreation({
          _existingFlatViewMaps: validateAndBuildResult.optimisticFlatViewMaps,
          flatViewToValidate: flatViewToCreate,
          optimisticFlatObjectMetadataMaps:
            dependencyOptimisticEntityMaps.object,
        });

      if (validationErrors.viewLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatViewToCreate,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewMaps,
        });

      const createViewAction = getWorkspaceMigrationV2ViewCreateAction({
        flatView: flatViewToCreate,
      });

      validateAndBuildResult.created.push(createViewAction);
    }

    for (const flatViewToDelete of buildOptions.inferDeletionFromMissingEntities
      ? deletedFlatView
      : []) {
      const validationErrors =
        this.flatViewValidatorService.validateFlatViewDeletion({
          existingFlatViewMaps: validateAndBuildResult.optimisticFlatViewMaps,
          viewIdToDelete: flatViewToDelete.id,
        });

      if (validationErrors.viewLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewMaps =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatViewToDelete.id,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewMaps,
        });

      const deleteViewAction =
        getWorkspaceMigrationV2ViewDeleteAction(flatViewToDelete);

      validateAndBuildResult.deleted.push(deleteViewAction);
    }

    for (const { from: fromFlatView, to: toFlatView } of updatedFlatView) {
      const viewUpdatedProperties = compareTwoFlatView({
        fromFlatView,
        toFlatView,
      });

      if (viewUpdatedProperties.length === 0) {
        continue;
      }

      const validationErrors =
        this.flatViewValidatorService.validateFlatViewUpdate({
          existingFlatViewMaps: validateAndBuildResult.optimisticFlatViewMaps,
          updatedFlatView: toFlatView,
        });

      if (validationErrors.viewLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewMaps =
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: toFlatView,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewMaps,
        });

      const updateViewAction: UpdateViewAction = {
        type: 'update_view',
        viewId: toFlatView.id,
        updates: viewUpdatedProperties,
      };

      validateAndBuildResult.updated.push(updateViewAction);
    }

    return validateAndBuildResult;
  }
}
