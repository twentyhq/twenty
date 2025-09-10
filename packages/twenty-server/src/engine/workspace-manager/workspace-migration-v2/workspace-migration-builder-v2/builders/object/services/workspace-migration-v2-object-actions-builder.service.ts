import { Injectable } from '@nestjs/common';

import { FromTo } from 'twenty-shared/types';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { type CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { ValidateAndBuildMetadataResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/validate-and-build-metadata-result.type';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix = FromTo<
  FlatObjectMetadataMaps,
  'FlatObjectMetadataMaps'
> &
  CustomDeletedCreatedUpdatedMatrix<
    'flatObjectMetadatas',
    FlatObjectMetadata
  > & {
    buildOptions: WorkspaceMigrationV2BuilderOptions;
    fromFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  };

@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilderService {
  constructor(
    private readonly flatObjectMetadataValidatorService: FlatObjectMetadataValidatorService,
  ) {}

  public async validateAndBuildObjectActions({
    createdFlatObjectMetadatas,
    deletedFlatObjectMetadatas,
    updatedFlatObjectMetadatas,
    buildOptions,
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
  }: CreatedDeletedUpdatedObjectMetadataInputMatrix): Promise<
    ValidateAndBuildMetadataResult<WorkspaceMigrationObjectActionV2>
  > {
    const validateAndBuildResult: ValidateAndBuildMetadataResult<WorkspaceMigrationObjectActionV2> =
      {
        failed: [],
        created: [],
        deleted: [],
        updated: [],
        optimisticFlatObjectMetadataMaps: structuredClone(
          fromFlatObjectMetadataMaps,
        ),
      };

    for (const flatObjectMetadataToCreate of createdFlatObjectMetadatas) {
      const validationErrors =
        await this.flatObjectMetadataValidatorService.validateFlatObjectMetadataCreation(
          {
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            flatObjectMetadataToValidate: flatObjectMetadataToCreate,
            otherFlatObjectMetadataMapsToValidate: toFlatObjectMetadataMaps,
          },
        );

      if (
        validationErrors.fieldLevelErrors.length > 0 ||
        validationErrors.objectLevelErrors.length > 0
      ) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
          flatObjectMetadata: flatObjectMetadataToCreate,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      const createFieldActions =
        flatObjectMetadataToCreate.flatFieldMetadatas.map((flatFieldMetadata) =>
          getWorkspaceMigrationV2FieldCreateAction({
            flatFieldMetadata,
            flatObjectMetadata: flatObjectMetadataToCreate,
          }),
        );

      const createObjectAction = getWorkspaceMigrationV2ObjectCreateAction({
        flatObjectMetadata: flatObjectMetadataToCreate,
        createFieldActions,
      });

      validateAndBuildResult.created.push(createObjectAction);
    }

    for (const flatObjectMetadataToDelete of buildOptions.inferDeletionFromMissingEntities
      ? deletedFlatObjectMetadatas
      : []) {
      const validationErrors =
        this.flatObjectMetadataValidatorService.validateFlatObjectMetadataDeletion(
          {
            buildOptions,
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            objectMetadataToDeleteId: flatObjectMetadataToDelete.id,
          },
        );

      if (
        validationErrors.fieldLevelErrors.length > 0 ||
        validationErrors.objectLevelErrors.length > 0
      ) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        deleteObjectFromFlatObjectMetadataMapsOrThrow({
          objectMetadataId: flatObjectMetadataToDelete.id,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      const deleteObjectAction = getWorkspaceMigrationV2ObjectDeleteAction(
        flatObjectMetadataToDelete,
      );

      validateAndBuildResult.deleted.push(deleteObjectAction);
    }

    for (const {
      from: fromFlatObjectMetadata,
      to: toFlatObjectMetadata,
    } of updatedFlatObjectMetadatas) {
      const objectUpdatedProperties = compareTwoFlatObjectMetadata({
        from: fromFlatObjectMetadata,
        to: toFlatObjectMetadata,
      });

      if (objectUpdatedProperties.length === 0) {
        continue;
      }

      const validationErrors =
        this.flatObjectMetadataValidatorService.validateFlatObjectMetadataUpdate(
          {
            existingFlatObjectMetadataMaps:
              validateAndBuildResult.optimisticFlatObjectMetadataMaps,
            updatedFlatObjectMetadata: toFlatObjectMetadata,
          },
        );

      if (
        validationErrors.fieldLevelErrors.length > 0 ||
        validationErrors.objectLevelErrors.length > 0
      ) {
        validateAndBuildResult.failed.push(validationErrors);
        continue;
      }

      validateAndBuildResult.optimisticFlatObjectMetadataMaps =
        replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
          flatObjectMetadata: toFlatObjectMetadata,
          flatObjectMetadataMaps:
            validateAndBuildResult.optimisticFlatObjectMetadataMaps,
        });

      const updateObjectAction: UpdateObjectAction = {
        type: 'update_object',
        objectMetadataId: toFlatObjectMetadata.id,
        updates: objectUpdatedProperties,
      };

      validateAndBuildResult.updated.push(updateObjectAction);
    }

    return validateAndBuildResult;
  }
}
