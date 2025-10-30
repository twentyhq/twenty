import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.view
> {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {
    super(ALL_METADATA_NAME.view);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'created'>
  > {
    const validationResult =
      await this.flatViewValidatorService.validateFlatViewCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatObjectMetadata,
        viewIds: [...flatObjectMetadata.viewIds, flatViewToValidate.id],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const kanbanFieldMetadata = isDefined(
      flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
          flatEntityMaps:
            mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;

    if (isDefined(kanbanFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...kanbanFieldMetadata,
          kanbanAggregateOperationViewIds: [
            ...kanbanFieldMetadata.kanbanAggregateOperationViewIds,
            flatViewToValidate.id,
          ],
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    const calendarFieldMetadata = isDefined(
      flatViewToValidate.calendarFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: flatViewToValidate.calendarFieldMetadataId,
          flatEntityMaps:
            mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;

    if (isDefined(calendarFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...calendarFieldMetadata,
          calendarViewIds: [
            ...calendarFieldMetadata.calendarViewIds,
            flatViewToValidate.id,
          ],
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    return {
      status: 'success',
      action: {
        type: 'create_view',
        view: flatViewToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'deleted'>
  > {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatViewToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    if (isDefined(flatObjectMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          viewIds: flatObjectMetadata.viewIds.filter(
            (id) => id !== flatViewToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });
    }

    const kanbanFieldMetadata = isDefined(
      flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
          flatEntityMaps:
            mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;

    if (isDefined(kanbanFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...kanbanFieldMetadata,
          kanbanAggregateOperationViewIds:
            kanbanFieldMetadata.kanbanAggregateOperationViewIds.filter(
              (id) => id !== flatViewToValidate.id,
            ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    const calendarFieldMetadata = isDefined(
      flatViewToValidate.calendarFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatViewToValidate.calendarFieldMetadataId,
          flatEntityMaps:
            mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;

    if (isDefined(calendarFieldMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...calendarFieldMetadata,
          calendarViewIds: calendarFieldMetadata.calendarViewIds.filter(
            (id) => id !== flatViewToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
      });
    }

    return {
      status: 'success',
      action: {
        type: 'delete_view',
        viewId: flatViewToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'updated'>
  > {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewAction: UpdateViewAction = {
      type: 'update_view',
      viewId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewAction,
    };
  }
}
