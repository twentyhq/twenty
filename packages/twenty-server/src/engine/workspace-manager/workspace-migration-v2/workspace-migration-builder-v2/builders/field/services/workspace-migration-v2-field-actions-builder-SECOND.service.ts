import { Injectable } from '@nestjs/common';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export type FieldMetadataRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2FieldMetadataActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatFieldMetadata,
  WorkspaceMigrationFieldActionV2,
  FieldMetadataRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
  }: FlatEntityValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadata
    >
  > {
    const validationResult =
      this.flatFieldMetadataValidatorService.validateFlatFieldMetadataCreation({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
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
  }: FlatEntityValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadata
    >
  > {
    const validationResult =
      this.flatFieldMetadataValidatorService.validateFlatFieldMetadataDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
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
        type: 'delete_FieldMetadata',
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatFieldMetadata, to: toFlatFieldMetadata },
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationFieldActionV2,
        FlatFieldMetadata
      >
    | undefined
  > {
    
  }
}
