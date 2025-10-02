import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { compareTwoFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view-field.util';
import { ViewFieldRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/view-field-related-flat-entity-maps.type';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateViewFieldAction,
  WorkspaceMigrationViewFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'viewField',
  FlatViewField,
  WorkspaceMigrationViewFieldActionV2,
  ViewFieldRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {
    super('viewField');
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFieldToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
  }: FlatEntityValidationArgs<
    FlatViewField,
    ViewFieldRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewFieldActionV2,
      FlatViewField,
      ViewFieldRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      await this.flatViewFieldValidatorService.validateFlatViewFieldCreation({
        dependencyOptimisticFlatEntityMaps,
        flatViewFieldToValidate,
        optimisticFlatViewFieldMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const flatView = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFieldToValidate.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    const updatedFlatViewFields = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: {
        ...flatView,
        viewFieldIds: [...flatView.viewFieldIds, flatViewFieldToValidate.id],
      },
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    return {
      status: 'success',
      action: {
        type: 'create_view_field',
        viewField: flatViewFieldToValidate,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatViewMaps: updatedFlatViewFields,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFieldToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
  }: FlatEntityValidationArgs<
    FlatViewField,
    ViewFieldRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewFieldActionV2,
      FlatViewField,
      ViewFieldRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatViewFieldToValidate,
        optimisticFlatViewFieldMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    const updatedFlatViewFields = isDefined(flatView)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatView,
            viewFieldIds: flatView.viewFieldIds.filter(
              (id) => id !== flatViewFieldToValidate.id,
            ),
          },
          flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatViewMaps;

    return {
      status: 'success',
      action: {
        type: 'delete_view_field',
        viewFieldId: flatViewFieldToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatViewMaps: updatedFlatViewFields,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatViewField, to: toFlatViewField },
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatViewField,
    ViewFieldRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationViewFieldActionV2,
        FlatViewField,
        ViewFieldRelatedFlatEntityMaps
      >
    | undefined
  > {
    const viewFieldUpdatedProperties = compareTwoFlatViewField({
      fromFlatViewField,
      toFlatViewField,
    });

    if (viewFieldUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatViewFieldToValidate: toFlatViewField,
        optimisticFlatViewFieldMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateViewFieldAction: UpdateViewFieldAction = {
      type: 'update_view_field',
      viewFieldId: toFlatViewField.id,
      updates: viewFieldUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateViewFieldAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
