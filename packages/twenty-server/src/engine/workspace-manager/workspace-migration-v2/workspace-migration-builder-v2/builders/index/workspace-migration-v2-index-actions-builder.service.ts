import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class WorkspaceMigrationV2IndexActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.index
> {
  constructor(
    private readonly flatIndexValidatorService: FlatIndexValidatorService,
  ) {
    super(ALL_METADATA_NAME.index);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'create'> {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatIndexToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'index',
        flatEntity: flatIndexToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'delete'> {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatIndexToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'index',
        entityId: flatIndexToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate({
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    flatEntityId,
    flatEntityUpdates,
    buildOptions,
    workspaceId,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.index
  >): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'update'> {
    const flatEntity = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatIndexMaps,
    });

    if (!isDefined(flatEntity)) {
      return {
        status: 'fail',
        metadataName: 'index',
        type: 'update',
        flatEntityMinimalInformation: {
          id: flatEntityId,
        },
        errors: [
          {
            code: FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
            message: t`Index to delete not found`,
          },
        ],
      };
    }
    const deletionValidationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion({
        buildOptions,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        workspaceId,
        flatEntityToValidate: flatEntity,
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      });

    if (deletionValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        type: 'update',
        errors: deletionValidationResult.errors,
        flatEntityMinimalInformation:
          deletionValidationResult.flatEntityMinimalInformation,
        metadataName: deletionValidationResult.metadataName,
      };
    }

    const updatedFlatIndex = {
      ...flatEntity,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const tempOptimisticFlatIndexMaps = structuredClone(
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatIndexMaps,
    );

    deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
      entityToDeleteId: flatEntity.id,
      flatEntityMapsToMutate: tempOptimisticFlatIndexMaps,
    });

    const creationValidationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation({
        buildOptions,
        workspaceId,
        flatEntityToValidate: updatedFlatIndex,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          ...optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          flatIndexMaps: tempOptimisticFlatIndexMaps,
        },
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      });

    if (creationValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        type: 'update',
        errors: creationValidationResult.errors,
        flatEntityMinimalInformation:
          creationValidationResult.flatEntityMinimalInformation,
        metadataName: creationValidationResult.metadataName,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'update',
        metadataName: 'index',
        entityId: flatEntity.id,
        updatedFlatEntity: updatedFlatIndex,
      },
    };
  }
}
