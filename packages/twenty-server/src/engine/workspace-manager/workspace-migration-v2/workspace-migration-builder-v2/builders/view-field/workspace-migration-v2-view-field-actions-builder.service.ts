import { Injectable } from '@nestjs/common';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

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

export type ViewFieldRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatViewMaps'
>;
@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatViewField,
  FailedFlatViewFieldValidation, // should be generic and extends
  WorkspaceMigrationViewFieldActionV2,
  ViewFieldRelatedFlatEntityMaps
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
    dependencyOptimisticFlatEntityMaps,
  }: ValidateAndBuildActionsArgs<
    FlatViewField,
    ViewFieldRelatedFlatEntityMaps
  >) {
    let optimisticFlatViewFieldMaps = structuredClone(fromFlatViewFieldMaps);
    const validateAndBuildResult: ValidateAndBuilActionsReturnType<
      FailedFlatViewFieldValidation,
      WorkspaceMigrationViewFieldActionV2
    > = {
      failed: [],
      created: [],
      deleted: [],
      updated: [],
      optimisticAllFlatEntityMaps: {},
    };

    for (const flatViewFieldToCreate of createdFlatViewField) {
      const validationErrors =
        await this.flatViewFieldValidatorService.validateFlatViewFieldCreation({
          flatViewFieldToValidate: flatViewFieldToCreate,
          dependencyOptimisticFlatEntityMaps,
          optimisticFlatViewFieldMaps,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      optimisticFlatViewFieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewFieldToCreate,
        flatEntityMaps: optimisticFlatViewFieldMaps,
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
          optimisticFlatViewFieldMaps,
          flatViewFieldToValidate: flatViewFieldToDelete,
          dependencyOptimisticFlatEntityMaps,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      optimisticFlatViewFieldMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatViewFieldToDelete.id,
        flatEntityMaps: optimisticFlatViewFieldMaps,
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
          optimisticFlatViewFieldMaps,
          flatViewFieldToValidate: toFlatViewField,
          dependencyOptimisticFlatEntityMaps,
        });

      if (validationErrors.viewFieldLevelErrors.length > 0) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      optimisticFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: toFlatViewField,
        flatEntityMaps: optimisticFlatViewFieldMaps,
      });

      const updateViewFieldAction: UpdateViewFieldAction = {
        type: 'update_view_field',
        viewFieldId: toFlatViewField.id,
        updates: viewFieldUpdatedProperties,
      };

      validateAndBuildResult.updated.push(updateViewFieldAction);
    }

    return {
      ...validateAndBuildResult,
      optimisticAllFlatEntityMaps: {
        flatViewFieldMaps: optimisticFlatViewFieldMaps,
      },
    };
  }
}
