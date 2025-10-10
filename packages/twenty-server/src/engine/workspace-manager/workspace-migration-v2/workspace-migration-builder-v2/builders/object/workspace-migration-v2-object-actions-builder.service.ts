import { Injectable } from '@nestjs/common';

import { ALL_FLAT_ENTITY_CONSTANTS } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-contants.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-object-metadata-validator.service';
export type ObjectMetadataRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof ALL_FLAT_ENTITY_CONSTANTS.objectMetadata.relatedFlatEntityMapsKeys)[number]
>;

@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'objectMetadata',
  FlatObjectMetadata,
  WorkspaceMigrationObjectActionV2,
  ObjectMetadataRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatObjectValidatorService: FlatObjectMetadataValidatorService,
  ) {
    super('objectMetadata');
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    buildOptions,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    FlatObjectMetadata,
    ObjectMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationObjectActionV2,
      FlatObjectMetadata,
      ObjectMetadataRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      await this.flatObjectValidatorService.validateFlatObjectMetadataCreation({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_object',
        flatFieldMetadatas: [],
        flatObjectMetadata: flatObjectMetadataToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    buildOptions,
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    FlatObjectMetadata,
    ObjectMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationObjectActionV2,
      FlatObjectMetadata,
      ObjectMetadataRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataDeletion({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_object',
        objectMetadataId: flatObjectMetadataToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    buildOptions,
    flatEntityUpdate: {
      from: fromFlatObjectMetadata,
      to: toFlatObjectMetadata,
    },
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatObjectMetadata,
    ObjectMetadataRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationObjectActionV2,
        FlatObjectMetadata,
        ObjectMetadataRelatedFlatEntityMaps
      >
    | undefined
  > {
    const flatObjectPropertiesUpdates = compareTwoFlatObjectMetadata({
      fromFlatObjectMetadata,
      toFlatObjectMetadata,
    });

    if (flatObjectPropertiesUpdates.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataUpdate({
        buildOptions,
        flatObjectMetadataToValidate: toFlatObjectMetadata,
        optimisticFlatObjectMetadataMaps,
        dependencyOptimisticFlatEntityMaps,
        flatObjectPropertiesUpdates: flatObjectPropertiesUpdates,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateObjectAction: UpdateObjectAction = {
      type: 'update_object',
      objectMetadataId: toFlatObjectMetadata.id,
      updates: flatObjectPropertiesUpdates,
    };

    return {
      status: 'success',
      action: updateObjectAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
