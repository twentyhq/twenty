import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'create'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'fieldMetadata',
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
        flatFieldMetadatas: [flatFieldMetadataToValidate],
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'delete'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'fieldMetadata',
        entityId: flatFieldMetadataToValidate.id,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadata
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'update'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityId,
      flatEntityUpdates,
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    } = args;

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatEntityId,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataMaps,
    });

    const updateFieldAction: UpdateFieldAction = {
      type: 'update',
      metadataName: 'fieldMetadata',
      entityId: flatEntityId,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateFieldAction,
    };
  }
}
