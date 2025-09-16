import { Injectable } from '@nestjs/common';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder';
import {
    FailedFlatEntityValidation,
    FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type IndexValidationArgs = {
  flatIndexToValidate: FlatIndexMetadata;
  optimisticFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  dependencyOptimisticFlatEntityMaps: IndexRelatedFlatEntityMaps;
};
@Injectable()
export class FlatIndexValidatorService {
  constructor() {}

  // Should implement strict checking on field compared field and their integrity passing the update array would be the best
  public validateFlatIndexUpdate({
    flatIndexToValidate: updatedFlatIndex,
    optimisticFlatIndexMaps,
  }: IndexValidationArgs): FailedFlatEntityValidation<FlatIndexMetadata> {
    const errors: FlatEntityValidationError[] = [];

    const existingFlatIndex = optimisticFlatIndexMaps.byId[updatedFlatIndex.id];

    return {
      type: 'create_index',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatIndex.id,
      },
    };
  }

  public validateFlatIndexDeletion({
    optimisticFlatIndexMaps,
    flatIndexToValidate: { id: viewFieldIdToDelete },
  }: IndexValidationArgs): FailedFlatEntityValidation<FlatIndexMetadata> {
    const errors: FlatEntityValidationError[] = [];

    const _existingFlatIndex =
      optimisticFlatIndexMaps.byId[viewFieldIdToDelete];

    return {
      type: 'delete_index',
      errors,
      flatEntityMinimalInformation: {
        id: viewFieldIdToDelete,
      },
    };
  }

  public async validateFlatIndexCreation({
    flatIndexToValidate,
    optimisticFlatIndexMaps,
    dependencyOptimisticFlatEntityMaps: {},
  }: {
    flatIndexToValidate: FlatIndexMetadata;
    optimisticFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    dependencyOptimisticFlatEntityMaps: IndexRelatedFlatEntityMaps;
  }): Promise<FailedFlatEntityValidation<FlatIndexMetadata>> {
    const errors: FlatEntityValidationError[] = [];

    return {
      type: 'create_index',
      errors,
      flatEntityMinimalInformation: {
        id: flatIndexToValidate.id,
      },
    };
  }
}
