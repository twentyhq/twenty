import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';

export type FieldMetadataRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2FieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'fieldMetadata',
  FlatFieldMetadata,
  WorkspaceMigrationFieldActionV2,
  FieldMetadataRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatFieldValidatorService: FlatFieldMetadataValidatorService,
  ) {
    super('fieldMetadata');
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
    remainingFlatEntityMapsToValidate,
  }: FlatEntityValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadata,
      FieldMetadataRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      await this.flatFieldValidatorService.validateFlatFieldMetadataCreation({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        workspaceId,
        remainingFlatEntityMapsToValidate,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatFieldMetadataToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          fieldMetadataIds: [
            ...flatObjectMetadata.fieldMetadataIds,
            flatFieldMetadataToValidate.id,
          ],
        },
        flatEntityMaps:
          dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });

    return {
      status: 'success',
      action: {
        type: 'create_field',
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
        flatFieldMetadatas: [flatFieldMetadataToValidate],
      },
      dependencyOptimisticFlatEntityMaps: {
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
  }: FlatEntityValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationFieldActionV2,
      FlatFieldMetadata,
      FieldMetadataRelatedFlatEntityMaps
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

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldMetadataToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps = isDefined(flatObjectMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatObjectMetadata,
            fieldMetadataIds: flatObjectMetadata.fieldMetadataIds.filter(
              (id) => id !== flatFieldMetadataToValidate.id,
            ),
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

    return {
      status: 'success',
      action: {
        type: 'delete_field',
        fieldMetadataId: flatFieldMetadataToValidate.id,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      },
      dependencyOptimisticFlatEntityMaps: {
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatFieldMetadata, to: toFlatFieldMetadata },
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    workspaceId,
  }: FlatEntityUpdateValidationArgs<
    FlatFieldMetadata,
    FieldMetadataRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationFieldActionV2,
        FlatFieldMetadata,
        FieldMetadataRelatedFlatEntityMaps
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
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
