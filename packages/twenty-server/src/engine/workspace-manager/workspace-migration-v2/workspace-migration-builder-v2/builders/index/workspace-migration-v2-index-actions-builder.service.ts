import { Injectable } from '@nestjs/common';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { compareTwoFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/compare-two-flat-index-metadata.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import {
  getWorkspaceMigrationV2CreateIndexAction,
  getWorkspaceMigrationV2DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';

export type IndexRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2IndexActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatIndexMetadata,
  WorkspaceMigrationIndexActionV2,
  IndexRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatIndexValidatorService: FlatIndexValidatorService,
  ) {
    super();
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
      FlatIndexMetadata
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

    return {
      status: 'success',
      action: getWorkspaceMigrationV2CreateIndexAction(flatIndexToValidate),
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
      FlatIndexMetadata
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

    return {
      status: 'success',
      action: getWorkspaceMigrationV2DeleteIndexAction(flatIndexToValidate),
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
        FlatIndexMetadata
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
          flatEntityMaps: optimisticFlatIndexMaps
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
        getWorkspaceMigrationV2DeleteIndexAction(fromFlatIndex),
        getWorkspaceMigrationV2CreateIndexAction(toFlatIndex),
      ],
    };
  }
}
