import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { UpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.viewField
> {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewField);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewField,
      'created'
    >
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewFieldToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFieldToValidate.fieldMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatFieldMetadata,
        viewFieldIds: [
          ...flatFieldMetadata.viewFieldIds,
          flatViewFieldToValidate.id,
        ],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    const flatView = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFieldToValidate.viewId,
      flatEntityMaps: mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatView,
        viewFieldIds: [...flatView.viewFieldIds, flatViewFieldToValidate.id],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    return {
      status: 'success',
      action: {
        type: 'create_view_field',
        viewField: flatViewFieldToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewField,
      'deleted'
    >
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewFieldToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.fieldMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (isDefined(flatFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatFieldMetadata,
          viewFieldIds: flatFieldMetadata.viewFieldIds.filter(
            (id) => id !== flatViewFieldToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.viewId,
      flatEntityMaps: mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    if (isDefined(flatView)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatView,
          viewFieldIds: flatView.viewFieldIds.filter(
            (id) => id !== flatViewFieldToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
      });
    }

    return {
      status: 'success',
      action: {
        type: 'delete_view_field',
        viewFieldId: flatViewFieldToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewField,
      'updated'
    >
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewFieldAction: UpdateViewFieldAction = {
      type: 'update_view_field',
      viewFieldId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewFieldAction,
    };
  }
}
