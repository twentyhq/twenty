import { Injectable } from '@nestjs/common';

import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { compareTwoFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view-field.util';
import { ViewFieldRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/view-field-related-flat-entity-maps.type';
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
  FlatViewField,
  WorkspaceMigrationViewFieldActionV2,
  ViewFieldRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {
    super();
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
      FlatViewField
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

    return {
      status: 'success',
      action: {
        type: 'create_view_field',
        viewField: flatViewFieldToValidate,
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
      FlatViewField
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

    return {
      status: 'success',
      action: {
        type: 'delete_view_field',
        viewFieldId: flatViewFieldToValidate.id,
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
        FlatViewField
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
    };
  }
}
