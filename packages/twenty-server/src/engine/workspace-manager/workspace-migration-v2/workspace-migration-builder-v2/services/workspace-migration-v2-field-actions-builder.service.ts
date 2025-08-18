import { Injectable } from '@nestjs/common';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { MetadataActionValidateAndBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-action-validate-and-build-result.type';
import { MetadataValidateAndBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-validate-and-build-result.type';
import {
  type UpdateFieldAction,
  type WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';

type BuildWorkspaceMigrationV2FieldActionsArgs = {
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  fromFlatObjectMetadataMaps: FlatObjectMetadataMaps; // should be renamed to from
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[];
};

type ValidateAndBuildUpdatedFlatFieldMetadataArgs = {
  toFlatFieldMetadata: FlatFieldMetadata;
  updates: UpdateFieldAction['updates'];
  fromFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};

type validateFlatObjectMetadataFlatFieldMetadataMatrixArgs = {
  fromFlatObjectMetadataMaps: FlatObjectMetadataMaps;
} & UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix;

@Injectable()
export class WorkspaceMigrationV2FieldActionsBuilderService {
  constructor(
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {}

  private async validateAndBuildUpdatedFlatFieldMetadata({
    fromFlatObjectMetadataMaps,
    toFlatFieldMetadata,
    updates,
  }: ValidateAndBuildUpdatedFlatFieldMetadataArgs): Promise<
    MetadataValidateAndBuildResult<UpdateFieldAction>
  > {
    const {
      workspaceId,
      id: fieldMetadataId,
      objectMetadataId,
    } = toFlatFieldMetadata;

    const validationErrors =
      await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataUpdate(
        {
          existingFlatObjectMetadataMaps: fromFlatObjectMetadataMaps,
          flatFieldMetadataToValidate: toFlatFieldMetadata,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate: undefined,
        },
      );

    if (validationErrors.length > 0) {
      return {
        status: 'fail',
        errors: validationErrors,
      };
    }

    return {
      status: 'success',
      result: {
        type: 'update_field',
        fieldMetadataId,
        objectMetadataId,
        workspaceId,
        updates,
      },
    };
  }

  private async validateFlatObjectMetadataFlatFieldMetadataMatrix({
    createdFlatFieldMetadatas,
    deletedFlatFieldMetadatas,
    flatObjectMetadata,
    updatedFlatFieldMetadatas,
    fromFlatObjectMetadataMaps,
  }: validateFlatObjectMetadataFlatFieldMetadataMatrixArgs): Promise<
    MetadataActionValidateAndBuildResult<WorkspaceMigrationFieldActionV2>
  > {
    const validateAndBuildResult: MetadataActionValidateAndBuildResult<WorkspaceMigrationFieldActionV2> =
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
            existingFlatObjectMetadataMaps: fromFlatObjectMetadataMaps,
            flatFieldMetadataToValidate: toFlatFieldMetadata,
            workspaceId,
            otherFlatObjectMetadataMapsToValidate: undefined,
          },
        );

      if (validationErrors.length > 0) {
        validateAndBuildResult.failed.push({
          status: 'fail',
          errors: validationErrors,
        });
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: toFlatFieldMetadata,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      validateAndBuildResult.successful.push({
        status: 'success',
        result: {
          type: 'update_field',
          fieldMetadataId,
          objectMetadataId,
          workspaceId,
          updates,
        },
      });
    }

    return validateAndBuildResult;
  }

  public async build({
    buildOptions,
    fromFlatObjectMetadataMaps,
    objectMetadataDeletedCreatedUpdatedFields,
  }: BuildWorkspaceMigrationV2FieldActionsArgs): Promise<
    MetadataActionValidateAndBuildResult<WorkspaceMigrationFieldActionV2>
  > {
    let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationFieldActionV2[] =
      [];
    let validateAndBuildResult: MetadataActionValidateAndBuildResult<WorkspaceMigrationFieldActionV2> =
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

      const createFieldAction = createdFlatFieldMetadatas.map(
        (flatFieldMetadata) =>
          getWorkspaceMigrationV2FieldCreateAction({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
      );

      const deleteFieldAction =
        buildOptions.inferDeletionFromMissingObjectFieldIndex
          ? deletedFlatFieldMetadatas.map((flatFieldMetadata) =>
              getWorkspaceMigrationV2FieldDeleteAction({
                flatFieldMetadata,
                flatObjectMetadata,
              }),
            )
          : [];

      allUpdatedObjectMetadataFieldActions =
        allUpdatedObjectMetadataFieldActions.concat([
          ...createFieldAction,
          ...deleteFieldAction,
          ...updateFieldActions,
        ]);
    }

    return allUpdatedObjectMetadataFieldActions;
  }
}
