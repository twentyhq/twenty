import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-index-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationIndexActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.index
> {
  constructor(
    private readonly flatIndexValidatorService: FlatIndexValidatorService,
  ) {
    super(ALL_METADATA_NAME.index);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.index,
    'create'
  > {
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
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.index,
    'delete'
  > {
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
        universalIdentifier: flatIndexToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate({
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    universalIdentifier,
    flatEntityUpdate,
    buildOptions,
    workspaceId,
    additionalCacheDataMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.index
  >): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.index,
    'update'
  > {
    const flatEntity = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatIndexMaps,
    });

    if (!isDefined(flatEntity)) {
      return {
        status: 'fail',
        metadataName: 'index',
        type: 'update',
        flatEntityMinimalInformation: {
          universalIdentifier,
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
        additionalCacheDataMaps,
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

    const updatedFlatIndex: UniversalFlatIndexMetadata = {
      ...flatEntity,
      ...flatEntityUpdate,
    };

    const tempOptimisticFlatIndexMaps = structuredClone(
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatIndexMaps,
    );

    deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow({
      universalIdentifierToDelete: flatEntity.universalIdentifier,
      universalFlatEntityMapsToMutate: tempOptimisticFlatIndexMaps,
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
        additionalCacheDataMaps,
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
        universalIdentifier,
        updatedUniversalFlatIndex: updatedFlatIndex,
        update: {},
      },
    };
  }
}
