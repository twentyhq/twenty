import { Injectable } from '@nestjs/common';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { compareTwoFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view-field.util';
import {
  ValidateAndBuilActionsReturnType,
  ValidateAndBuildActionsArgs,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateViewFieldAction,
  WorkspaceMigrationViewFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import {
  getWorkspaceMigrationV2ViewFieldCreateAction,
  getWorkspaceMigrationV2ViewFieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-view-field-action';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';

type DependencyMaps = ['flatObjectMetadataMaps', 'flatViewMaps'];
@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatViewField,
  FailedFlatViewFieldValidation, // just be generic
  WorkspaceMigrationViewFieldActionV2,
  DependencyMaps
> {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {
    super();
  }

  public async validateAndBuildActions({
    created: createdFlatViewField,
    deleted: deletedFlatViewField,
    updated: updatedFlatViewField,
    buildOptions,
    from: fromFlatViewFieldMaps,
    dependencyFlatEntityMaps: dependencyOptimisticFlatEntityMaps,
    // need other maps
  }: ValidateAndBuildActionsArgs<FlatViewField, DependencyMaps>): Promise<
    ValidateAndBuilActionsReturnType<
      FailedFlatViewFieldValidation,
      WorkspaceMigrationViewFieldActionV2
    >
  > {
    const validateAndBuildResult: ValidateAndBuilActionsReturnType<
      FailedFlatViewFieldValidation,
      WorkspaceMigrationViewFieldActionV2
    > = {
      failed: [],
      created: [],
      deleted: [],
      updated: [],
      optimisticAllFlatEntityMaps: structuredClone({
        flatViewFieldMaps: fromFlatViewFieldMaps,
      }),
    };

    for (const flatViewFieldToCreate of createdFlatViewField) {
      const validationErrors =
        await this.flatViewFieldValidatorService.validateFlatViewFieldCreation({
          flatViewFieldToValidate: flatViewFieldToCreate,
          optimisticFlatObjectMetadataMaps:
            dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
          optimisticFlatViewMaps:
            dependencyOptimisticFlatEntityMaps.flatViewMaps,
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
