import { Injectable } from '@nestjs/common';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateFieldAction,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export type FieldMetadataRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2FieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatFieldMetadataSecond,
  WorkspaceMigrationFieldActionV2,
  FieldMetadataRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatFieldValidatorService: FlatFieldMetadataValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
    otherFlatEntitiesToValidate: otherFlatFieldMetadataMapsToValidate,
  }: FlatEntityValidationArgs<
    FlatFieldMetadataSecond,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadataSecond
    >
  > {
    const validationResult =
      await this.flatFieldValidatorService.validateFlatFieldMetadataCreation({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        workspaceId,
        otherFlatFieldMetadataMapsToValidate,
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
        type: 'create_field',
        flatFieldMetadata: flatFieldMetadataToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
  }: FlatEntityValidationArgs<
    FlatFieldMetadataSecond,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadataSecond
    >
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        workspaceId,
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
        type: 'delete_field',
        fieldMetadataId: flatFieldMetadataToValidate.id,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatFieldMetadata, to: toFlatFieldMetadata },
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
    otherFlatEntitiesToValidate: otherFlatFieldMetadataMapsToValidate,
  }: FlatEntityUpdateValidationArgs<
    FlatFieldMetadataSecond,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationFieldActionV2,
        FlatFieldMetadataSecond
      >
    | undefined
  > {
    const flatFieldMetadataUpdatedProperties = compareTwoFlatFieldMetadata({
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
    });

    if (flatFieldMetadataUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      await this.flatFieldValidatorService.validateFlatFieldMetadataUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate: toFlatFieldMetadata,
        optimisticFlatFieldMetadataMaps,
        workspaceId,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateFieldAction: UpdateFieldAction = {
      type: 'update_field',
      fieldMetadataId: toFlatFieldMetadata.id,
      objectMetadataId: toFlatFieldMetadata.objectMetadataId,
      updates: flatFieldMetadataUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateFieldAction,
    };
  }
}
