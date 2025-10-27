import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
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
      dependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });
    const updatedFlatObjectMetadataMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          viewIds: [...flatObjectMetadata.viewIds, flatViewToValidate.id],
        },
        flatEntityMaps:
          dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });

    const kanbanFieldMetadata = isDefined(
      flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;
    const updatedFlatFieldMetadataMapsWithKanban = isDefined(
      kanbanFieldMetadata,
    )
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...kanbanFieldMetadata,
            kanbanAggregateOperationViewIds: [
              ...kanbanFieldMetadata.kanbanAggregateOperationViewIds,
              flatViewToValidate.id,
            ],
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps;

    const calendarFieldMetadata = isDefined(
      flatViewToValidate.calendarFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: flatViewToValidate.calendarFieldMetadataId,
          flatEntityMaps: updatedFlatFieldMetadataMapsWithKanban,
        })
      : undefined;
    const updatedFlatFieldMetadataMaps = isDefined(calendarFieldMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...calendarFieldMetadata,
            calendarViewIds: [
              ...calendarFieldMetadata.calendarViewIds,
              flatViewToValidate.id,
            ],
          },
          flatEntityMaps: updatedFlatFieldMetadataMapsWithKanban,
        })
      : updatedFlatFieldMetadataMapsWithKanban;

    return {
      status: 'success',
      action: {
        type: 'create_view',
        view: flatViewToValidate,
      },
      dependencyOptimisticFlatEntityMaps: {
        flatFieldMetadataMaps: updatedFlatFieldMetadataMaps,
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
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
      dependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps = isDefined(flatObjectMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatObjectMetadata,
            viewIds: flatObjectMetadata.viewIds.filter(
              (id) => id !== flatViewToValidate.id,
            ),
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

    const kanbanFieldMetadata = isDefined(
      flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : undefined;

    const updatedFlatFieldMetadataMapsWithKanban = isDefined(
      kanbanFieldMetadata,
    )
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...kanbanFieldMetadata,
            kanbanAggregateOperationViewIds:
              kanbanFieldMetadata.kanbanAggregateOperationViewIds.filter(
                (id) => id !== flatViewToValidate.id,
              ),
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps;

    const calendarFieldMetadata = isDefined(
      flatViewToValidate.calendarFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatViewToValidate.calendarFieldMetadataId,
          flatEntityMaps: updatedFlatFieldMetadataMapsWithKanban,
        })
      : undefined;

    const updatedFlatFieldMetadataMaps = isDefined(calendarFieldMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...calendarFieldMetadata,
            calendarViewIds: calendarFieldMetadata.calendarViewIds.filter(
              (id) => id !== flatViewToValidate.id,
            ),
          },
          flatEntityMaps: updatedFlatFieldMetadataMapsWithKanban,
        })
      : updatedFlatFieldMetadataMapsWithKanban;

    return {
      status: 'success',
      action: {
        type: 'delete_view',
        viewId: flatViewToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps: {
        flatFieldMetadataMaps: updatedFlatFieldMetadataMaps,
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
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

    const {
      dependencyOptimisticFlatEntityMaps,
      flatEntityId,
      flatEntityUpdates,
    } = args;

    const updateViewAction: UpdateViewAction = {
      type: 'update_view',
      viewId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
