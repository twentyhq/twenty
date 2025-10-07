import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { compareTwoFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/compare-two-flat-index-metadata.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';

export type IndexRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2IndexActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'index',
  FlatIndexMetadata,
  WorkspaceMigrationIndexActionV2,
  IndexRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatIndexValidatorService: FlatIndexValidatorService,
  ) {
    super('index');
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatIndexToValidate,
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
  }: FlatEntityValidationArgs<
    FlatIndexMetadata,
    IndexRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationIndexActionV2,
      FlatIndexMetadata,
      IndexRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation({
        dependencyOptimisticFlatEntityMaps,
        flatIndexToValidate,
        optimisticFlatIndexMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

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

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatIndexToValidate,
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
  }: FlatEntityValidationArgs<
    FlatIndexMetadata,
    IndexRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationIndexActionV2,
      FlatIndexMetadata,
      IndexRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatIndexToValidate,
        optimisticFlatIndexMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

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

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatIndex, to: toFlatIndex },
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatIndexMetadata,
    IndexRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationIndexActionV2,
        FlatIndexMetadata,
        IndexRelatedFlatEntityMaps
      >
    | undefined
  > {
    const indexUpdatedProperties = compareTwoFlatIndexMetadata({
      fromFlatIndexMetadata: fromFlatIndex,
      toFlatIndexMetadata: toFlatIndex,
    });

    if (indexUpdatedProperties.length === 0) {
      return undefined;
    }

    const deletionValidationResult =
      this.flatIndexValidatorService.validateFlatIndexDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatIndexToValidate: fromFlatIndex,
        optimisticFlatIndexMaps,
      });

    if (deletionValidationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...deletionValidationResult,
      };
    }

    const creationValidationResult =
      this.flatIndexValidatorService.validateFlatIndexCreation({
        dependencyOptimisticFlatEntityMaps,
        flatIndexToValidate: toFlatIndex,
        optimisticFlatIndexMaps: deleteFlatEntityFromFlatEntityMapsOrThrow({
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
