import { Injectable } from '@nestjs/common';

import { FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation.type';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { compareTwoFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view-field.util';
import { WorkspaceMigrationOrchestratorOptimisticEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceViewFieldMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-view-field-migration-builder-v2.service';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import {
  UpdateViewFieldAction,
  WorkspaceMigrationViewFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import {
  getWorkspaceMigrationV2ViewFieldCreateAction,
  getWorkspaceMigrationV2ViewFieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-view-field-action';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';

export type CreatedDeletedUpdatedViewFieldInputMatrix = FromTo<
  FlatViewFieldMaps,
  'FlatViewFieldMaps'
> &
  CustomDeletedCreatedUpdatedMatrix<'flatViewField', FlatViewField> & {
    buildOptions: WorkspaceViewFieldMigrationV2BuilderOptions;
    fromFlatViewFieldMaps: FlatViewFieldMaps;
    dependencyOptimisticEntityMaps: WorkspaceMigrationOrchestratorOptimisticEntityMaps;
  };

type ValidateAndBuildViewFieldResult<T extends WorkspaceMigrationActionV2> = {
  failed: FailedFlatViewFieldValidation[];
  created: T[];
  deleted: T[];
  updated: T[];
  optimisticFlatViewFieldMaps: FlatViewFieldMaps;
};

@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {}

  public async validateAndBuildViewFieldActions({
    createdFlatViewField,
    deletedFlatViewField,
    updatedFlatViewField,
    buildOptions,
    fromFlatViewFieldMaps,
    dependencyOptimisticEntityMaps,
  }: CreatedDeletedUpdatedViewFieldInputMatrix): Promise<
    ValidateAndBuildViewFieldResult<WorkspaceMigrationViewFieldActionV2>
  > {
    const validateAndBuildResult: ValidateAndBuildViewFieldResult<WorkspaceMigrationViewFieldActionV2> =
      {
        failed: [],
        created: [],
        deleted: [],
        updated: [],
        optimisticFlatViewFieldMaps: structuredClone(fromFlatViewFieldMaps),
      };

    if (
      !isDefined(dependencyOptimisticEntityMaps.object) ||
      !isDefined(dependencyOptimisticEntityMaps.view)
    ) {
      throw new Error('Dependency optimistic entity maps are not defined');
    }

    for (const flatViewFieldToCreate of createdFlatViewField) {
      const validationErrors =
        await this.flatViewFieldValidatorService.validateFlatViewFieldCreation({
          _existingFlatViewFieldMaps:
            validateAndBuildResult.optimisticFlatViewFieldMaps,
          flatViewFieldToValidate: flatViewFieldToCreate,
          optimisticFlatObjectMetadataMaps:
            dependencyOptimisticEntityMaps.object,
          optimisticFlatViewMaps: dependencyOptimisticEntityMaps.view,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewFieldMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatViewFieldToCreate,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewFieldMaps,
        });

      const createViewFieldAction =
        getWorkspaceMigrationV2ViewFieldCreateAction({
          flatViewField: flatViewFieldToCreate,
        });

      validateAndBuildResult.created.push(createViewFieldAction);
    }

    for (const flatViewFieldToDelete of buildOptions.inferDeletionFromMissingEntities
      ? deletedFlatViewField
      : []) {
      const validationErrors =
        this.flatViewFieldValidatorService.validateFlatViewFieldDeletion({
          existingFlatViewFieldMaps:
            validateAndBuildResult.optimisticFlatViewFieldMaps,
          viewFieldIdToDelete: flatViewFieldToDelete.id,
          optimisticFlatViewMaps: dependencyOptimisticEntityMaps.view,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewFieldMaps =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatViewFieldToDelete.id,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewFieldMaps,
        });

      const deleteViewFieldAction =
        getWorkspaceMigrationV2ViewFieldDeleteAction(flatViewFieldToDelete);

      validateAndBuildResult.deleted.push(deleteViewFieldAction);
    }

    for (const {
      from: fromFlatViewField,
      to: toFlatViewField,
    } of updatedFlatViewField) {
      const viewFieldUpdatedProperties = compareTwoFlatViewField({
        fromFlatViewField,
        toFlatViewField,
      });

      if (viewFieldUpdatedProperties.length === 0) {
        continue;
      }

      const validationErrors =
        this.flatViewFieldValidatorService.validateFlatViewFieldUpdate({
          existingFlatViewFieldMaps:
            validateAndBuildResult.optimisticFlatViewFieldMaps,
          updatedFlatViewField: toFlatViewField,
          optimisticFlatViewMaps: dependencyOptimisticEntityMaps.view,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatViewFieldMaps =
        replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: toFlatViewField,
          flatEntityMaps: validateAndBuildResult.optimisticFlatViewFieldMaps,
        });

      const updateViewFieldAction: UpdateViewFieldAction = {
        type: 'update_view_field',
        viewFieldId: toFlatViewField.id,
        updates: viewFieldUpdatedProperties,
      };

      validateAndBuildResult.updated.push(updateViewFieldAction);
    }

    return validateAndBuildResult;
  }
}
