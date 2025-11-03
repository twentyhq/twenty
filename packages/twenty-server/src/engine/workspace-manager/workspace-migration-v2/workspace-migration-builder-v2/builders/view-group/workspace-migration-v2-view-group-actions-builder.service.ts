import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { UpdateViewGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/types/workspace-migration-view-group-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-group-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.viewGroup
> {
  constructor(
    private readonly flatViewGroupValidatorService: FlatViewGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewGroup);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewGroup,
      'created'
    >
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewGroupToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatView = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewGroupToValidate.viewId,
      flatEntityMaps: mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatView,
        viewGroupIds: [...flatView.viewGroupIds, flatViewGroupToValidate.id],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewGroupToValidate.fieldMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatFieldMetadata,
        viewGroupIds: [
          ...flatFieldMetadata.viewGroupIds,
          flatViewGroupToValidate.id,
        ],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    return {
      status: 'success',
      action: {
        type: 'create_view_group',
        viewGroup: flatViewGroupToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewGroup,
      'deleted'
    >
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewGroupToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewGroupToValidate.viewId,
      flatEntityMaps: mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    if (isDefined(flatView)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatView,
          viewGroupIds: flatView.viewGroupIds.filter(
            (id) => id !== flatViewGroupToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatViewMaps,
      });
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewGroupToValidate.fieldMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (isDefined(flatFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatFieldMetadata,
          viewGroupIds: flatFieldMetadata.viewGroupIds.filter(
            (id) => id !== flatViewGroupToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    return {
      status: 'success',
      action: {
        type: 'delete_view_group',
        viewGroupId: flatViewGroupToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.viewGroup,
      'updated'
    >
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewGroupAction: UpdateViewGroupAction = {
      type: 'update_view_group',
      viewGroupId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewGroupAction,
    };
  }
}
