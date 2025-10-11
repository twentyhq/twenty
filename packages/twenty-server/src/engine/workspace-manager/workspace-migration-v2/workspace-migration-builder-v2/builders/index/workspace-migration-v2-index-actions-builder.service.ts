import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';

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
      dependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          indexMetadataIds: [
            ...flatObjectMetadata.indexMetadataIds,
            flatIndexToValidate.id,
          ],
        },
        flatEntityMaps:
          dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });

    return {
      status: 'success',
      action: {
        type: 'create_index',
        flatIndexMetadata: flatIndexToValidate,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
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
      dependencyOptimisticFlatEntityMaps,
    } = args;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps = isDefined(flatObjectMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatObjectMetadata,
            indexMetadataIds: flatObjectMetadata.indexMetadataIds.filter(
              (id) => id !== flatIndexToValidate.id,
            ),
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

    return {
      status: 'success',
      action: {
        type: 'delete_index',
        flatIndexMetadataId: flatIndexToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.index>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.index, 'updated'>
  > {
    const {
      optimisticFlatEntityMaps: optimisticFlatIndexMaps,
      dependencyOptimisticFlatEntityMaps,
    } = args;

    // TODO prastoin handle this
    const deletionValidationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion({
      });

    if (deletionValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...deletionValidationResult,
      };
    }

    const creationValidationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation({
        ...args,
        optimisticFlatEntityMaps: deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: fromFlatIndex.id,
          flatEntityMaps: optimisticFlatIndexMaps,
        }),
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
          flatIndexMetadataId: fromFlatIndex.id,
        },
        {
          type: 'create_index',
          flatIndexMetadata: toFlatIndex,
        },
      ],
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
