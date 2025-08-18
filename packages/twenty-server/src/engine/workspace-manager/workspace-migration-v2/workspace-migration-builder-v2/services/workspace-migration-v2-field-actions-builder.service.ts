import { Injectable } from '@nestjs/common';

import { FieldMetadataType, FromTo } from 'twenty-shared/types';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { computeRelationTargetFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/compute-relation-target-flat-object-metadata-maps.util';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { ValidateAndBuildMetadataResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/validate-and-build-metadata-result.type';
import { type WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';

type BuildWorkspaceMigrationV2FieldActionsArgs = FromTo<
  FlatObjectMetadataMaps,
  'flatObjectMetadataMaps'
> & {
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[];
};

type ValidateFlatObjectMetadataFlatFieldMetadataMatrixArgs = FromTo<
  FlatObjectMetadataMaps,
  'flatObjectMetadataMaps'
> &
  UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix & {
    buildOptions: WorkspaceMigrationV2BuilderOptions;
  };

@Injectable()
export class WorkspaceMigrationV2FieldActionsBuilderService {
  constructor(
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {}

  private async validateFlatObjectMetadataFlatFieldMetadataMatrix({
    createdFlatFieldMetadatas,
    deletedFlatFieldMetadatas,
    flatObjectMetadata,
    updatedFlatFieldMetadatas,
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    buildOptions,
  }: ValidateFlatObjectMetadataFlatFieldMetadataMatrixArgs): Promise<
    ValidateAndBuildMetadataResult<WorkspaceMigrationFieldActionV2>
  > {
    const validateAndBuildResult: ValidateAndBuildMetadataResult<WorkspaceMigrationFieldActionV2> =
      {
        failed: [],
        successful: [],
        optimisticFlatObjectMetadataMaps: structuredClone(
          fromFlatObjectMetadataMaps,
        ),
      };

    for (const {
      from: fromFlatFieldMetadata,
      to: toFlatFieldMetadata,
    } of updatedFlatFieldMetadatas) {
      const updates = compareTwoFlatFieldMetadata({
        from: fromFlatFieldMetadata,
        to: toFlatFieldMetadata,
      });

      if (updates.length === 0) {
        continue;
      }

      const {
        workspaceId,
        id: fieldMetadataId,
        objectMetadataId,
      } = toFlatFieldMetadata;

      const validationErrors =
        await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataUpdate(
          {
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            flatFieldMetadataToValidate: toFlatFieldMetadata,
            workspaceId,
            otherFlatObjectMetadataMapsToValidate: undefined,
          },
        );

      if (validationErrors.length > 0) {
        validateAndBuildResult.failed.push(...validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: toFlatFieldMetadata,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      validateAndBuildResult.successful.push({
        type: 'update_field',
        fieldMetadataId,
        objectMetadataId,
        workspaceId,
        updates,
      });
    }

    for (const flatFieldMetadataToCreate of createdFlatFieldMetadatas) {
      const relationTargetFlatObjectMetadataMaps =
        isFlatFieldMetadataEntityOfType(
          flatFieldMetadataToCreate,
          FieldMetadataType.RELATION,
        ) ||
        isFlatFieldMetadataEntityOfType(
          flatFieldMetadataToCreate,
          FieldMetadataType.MORPH_RELATION,
        )
          ? computeRelationTargetFlatObjectMetadataMaps({
              flatFieldMetadata: flatFieldMetadataToCreate,
              flatObjectMetadataMaps: toFlatObjectMetadataMaps,
            })
          : undefined;

      const validationErrors =
        await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataCreation(
          {
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            flatFieldMetadataToValidate: flatFieldMetadataToCreate,
            workspaceId: flatFieldMetadataToCreate.workspaceId,
            otherFlatObjectMetadataMapsToValidate:
              relationTargetFlatObjectMetadataMaps,
          },
        );

      if (validationErrors.length > 0) {
        validateAndBuildResult.failed.push(...validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToCreate,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      const createFieldAction = getWorkspaceMigrationV2FieldCreateAction({
        flatFieldMetadata: flatFieldMetadataToCreate,
        flatObjectMetadata,
      });

      validateAndBuildResult.successful.push(createFieldAction);
    }

    for (const flatFieldMetadataToDelete of buildOptions.inferDeletionFromMissingObjectFieldIndex
      ? deletedFlatFieldMetadatas
      : []) {
      const validationErrors =
        this.flatFieldMetadataValidatorService.validateFlatFieldMetadataDeletion(
          {
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            flatFieldMetadataToDelete,
          },
        );

      if (validationErrors.length > 0) {
        validateAndBuildResult.failed.push(...validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        deleteFieldFromFlatObjectMetadataMapsOrThrow({
          fieldMetadataId: flatFieldMetadataToDelete.id,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
          objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
        });

      const deleteFieldAction = getWorkspaceMigrationV2FieldDeleteAction({
        flatFieldMetadata: flatFieldMetadataToDelete,
        flatObjectMetadata,
      });

      validateAndBuildResult.successful.push(deleteFieldAction);
    }

    return validateAndBuildResult;
  }

  public async validateAndBuildFieldActions({
    buildOptions,
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    objectMetadataDeletedCreatedUpdatedFields,
  }: BuildWorkspaceMigrationV2FieldActionsArgs): Promise<
    ValidateAndBuildMetadataResult<WorkspaceMigrationFieldActionV2>
  > {
    let validateAndBuildResult: ValidateAndBuildMetadataResult<WorkspaceMigrationFieldActionV2> =
      {
        failed: [],
        successful: [],
        optimisticFlatObjectMetadataMaps: structuredClone(
          fromFlatObjectMetadataMaps,
        ),
      };

    for (const {
      createdFlatFieldMetadatas,
      deletedFlatFieldMetadatas,
      updatedFlatFieldMetadatas,
      flatObjectMetadata,
    } of objectMetadataDeletedCreatedUpdatedFields) {
      const flatObjectMetadataFlatFieldMatrixValidateAndBuildResult =
        await this.validateFlatObjectMetadataFlatFieldMetadataMatrix({
          createdFlatFieldMetadatas,
          deletedFlatFieldMetadatas,
          flatObjectMetadata,
          fromFlatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
          updatedFlatFieldMetadatas,
          toFlatObjectMetadataMaps,
          buildOptions,
        });

      validateAndBuildResult = {
        failed: [
          ...validateAndBuildResult.failed,
          ...flatObjectMetadataFlatFieldMatrixValidateAndBuildResult.failed,
        ],
        successful: [
          ...validateAndBuildResult.successful,
          ...flatObjectMetadataFlatFieldMatrixValidateAndBuildResult.successful,
        ],
        optimisticFlatObjectMetadataMaps:
          flatObjectMetadataFlatFieldMatrixValidateAndBuildResult.optimisticFlatObjectMetadataMaps,
      };
    }

    return validateAndBuildResult;
  }
}
