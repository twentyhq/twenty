import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
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

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'created'>
  > {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatIndexToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatObjectMetadata,
        indexMetadataIds: [
          ...flatObjectMetadata.indexMetadataIds,
          flatIndexToValidate.id,
        ],
      },
      flatEntityMapsToMutate:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    return {
      status: 'success',
      action: {
        type: 'create_index',
        flatIndexMetadata: flatIndexToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'deleted'>
  > {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatIndexToValidate,
      mutableDependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps:
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    if (isDefined(flatObjectMetadata)) {
      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          indexMetadataIds: flatObjectMetadata.indexMetadataIds.filter(
            (id) => id !== flatIndexToValidate.id,
          ),
        },
        flatEntityMapsToMutate:
          mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });
    }

    return {
      status: 'success',
      action: {
        type: 'delete_index',
        flatIndexMetadataId: flatIndexToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
    mutableDependencyOptimisticFlatEntityMaps,
    buildOptions,
    workspaceId,
  }: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.index>): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'updated'>
  > {
    const flatEntity = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatIndexMaps,
    });

    if (!isDefined(flatEntity)) {
      return {
        status: 'fail',
        type: 'delete_index',
        flatEntityMinimalInformation: {},
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
        mutableDependencyOptimisticFlatEntityMaps,
        optimisticFlatEntityMaps: optimisticFlatIndexMaps,
        workspaceId,
        flatEntityToValidate: flatEntity,
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      });

    if (deletionValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...deletionValidationResult,
      };
    }

    const updatedFlatIndex = {
      ...flatEntity,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const tempOptimisticFlatIndexMaps = structuredClone(
      optimisticFlatIndexMaps,
    );

    deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
      entityToDeleteId: flatEntity.id,
      flatEntityMapsToMutate: tempOptimisticFlatIndexMaps,
    });

    const creationValidationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation({
        buildOptions,
        mutableDependencyOptimisticFlatEntityMaps,
        workspaceId,
        flatEntityToValidate: updatedFlatIndex,
        optimisticFlatEntityMaps: tempOptimisticFlatIndexMaps,
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      });

    if (creationValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...creationValidationResult,
      };
    }

    return {
      status: 'success',
      action: [
        {
          type: 'delete_index',
          flatIndexMetadataId: flatEntity.id,
        },
        {
          type: 'create_index',
          flatIndexMetadata: updatedFlatIndex,
        },
      ],
    };
  }
}
