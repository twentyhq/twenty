import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationV2FieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.fieldMetadata
> {
  constructor(
    private readonly flatFieldValidatorService: FlatFieldMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.fieldMetadata);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.fieldMetadata,
      'created'
    >
  > {
    const validationResult =
      await this.flatFieldValidatorService.validateFlatFieldMetadataCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatFieldMetadataToValidate,
      dependencyOptimisticFlatEntityMaps,
    } = args;

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

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.fieldMetadata,
      'deleted'
    >
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatFieldMetadataToValidate,
      dependencyOptimisticFlatEntityMaps,
    } = args;

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

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadata
    >,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.fieldMetadata,
      'updated'
    >
  > {
    const validationResult =
      await this.flatFieldValidatorService.validateFlatFieldMetadataUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      dependencyOptimisticFlatEntityMaps,
      flatEntityId,
      flatEntityUpdates,
      optimisticFlatEntityMaps,
    } = args;

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatEntityId,
      flatEntityMaps: optimisticFlatEntityMaps,
    });

    const updateFieldAction: UpdateFieldAction = {
      type: 'update_field',
      fieldMetadataId: flatEntityId,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateFieldAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
