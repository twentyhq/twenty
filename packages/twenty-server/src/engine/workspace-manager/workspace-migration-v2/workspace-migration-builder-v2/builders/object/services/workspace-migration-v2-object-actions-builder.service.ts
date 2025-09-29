import { Injectable } from '@nestjs/common';

import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { FlatObjectMetadataSecond } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatObjectMetadataSecond,
  WorkspaceMigrationObjectActionV2
> {
  constructor(
    private readonly flatObjectValidatorService: FlatObjectMetadataValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
    buildOptions,
  }: FlatEntityValidationArgs<FlatObjectMetadataSecond>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationObjectActionV2,
      FlatObjectMetadataSecond
    >
  > {
    const validationResult =
      await this.flatObjectValidatorService.validateFlatObjectMetadataCreation({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
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
        flatObjectMetadata: flatObjectMetadataToValidate, // We will need to make some aggreg here afterwards if necessary
      },
    };
  }

  protected async validateFlatEntityDeletion({
    buildOptions,
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
  }: FlatEntityValidationArgs<FlatObjectMetadataSecond>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationObjectActionV2,
      FlatObjectMetadataSecond
    >
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataDeletion({
        buildOptions,
        flatObjectMetadataToValidate,
        optimisticFlatObjectMetadataMaps,
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
    };
  }

  protected async validateFlatEntityUpdate({
    buildOptions,
    flatEntityUpdate: {
      from: fromFlatObjectMetadata,
      to: toFlatObjectMetadata,
    },
    optimisticFlatEntityMaps: optimisticFlatObjectMetadataMaps,
  }: FlatEntityUpdateValidationArgs<FlatObjectMetadataSecond>): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationObjectActionV2,
        FlatObjectMetadataSecond
      >
    | undefined
  > {
    const flatFieldMetadataUpdatedProperties = compareTwoFlatObjectMetadata({
      fromFlatObjectMetadata,
      toFlatObjectMetadata,
    });

    if (flatFieldMetadataUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataUpdate({
        buildOptions,
        flatObjectMetadataToValidate: toFlatObjectMetadata,
        optimisticFlatObjectMetadataMaps,
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
      updates: flatFieldMetadataUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateObjectAction,
    };
  }
}
