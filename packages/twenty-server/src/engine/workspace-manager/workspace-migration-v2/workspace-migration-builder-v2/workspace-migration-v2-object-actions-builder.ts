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
import { MetadataActionValidateAndBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-action-validate-and-build-result.type';
import { MetadataValidateAndBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-validate-and-build-result.type';
import {
  UpdateObjectAction,
  WorkspaceMigrationObjectActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { fromMetadataBuildResultsToFailedAndSuccessfulMetadataBuildRecord } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-metadata-build-results-to-failed-and-successful-metadata-build-record.util';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import {
  getWorkspaceMigrationV2ObjectCreateAction,
  getWorkspaceMigrationV2ObjectDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-object-actions';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix = FromTo<
  FlatObjectMetadataMaps,
  'FlatObjectMetadataMaps'
> &
  CustomDeletedCreatedUpdatedMatrix<
    'flatObjectMetadata',
    FlatObjectMetadata
  > & {
    buildOptions: WorkspaceMigrationV2BuilderOptions;
    fromFlatObjectMetadataMaps: FlatObjectMetadataMaps; // should be renamed to from
  };

@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilder {
  constructor(
    private readonly flatObjectMetadataValidatorService: FlatObjectMetadataValidatorService,
  ) {}

  public async validateAndBuildObjectActions({
    createdFlatObjectMetadata,
    deletedFlatObjectMetadata,
    updatedFlatObjectMetadata,
    buildOptions,
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
  }: CreatedDeletedUpdatedObjectMetadataInputMatrix): Promise<
    MetadataActionValidateAndBuildResult<WorkspaceMigrationObjectActionV2>
  > {
    let optimisticFlatObjectMetadataMaps = structuredClone(
      fromFlatObjectMetadataMaps,
    );
    const createdObjectBuildResults = await Promise.all(
      createdFlatObjectMetadata.map<
        Promise<
          MetadataValidateAndBuildResult<WorkspaceMigrationObjectActionV2>
        >
      >(async (flatObjectMetadata) => {
        const validationErrors =
          await this.flatObjectMetadataValidatorService.validateFlatObjectMetadataCreation(
            {
              existingFlatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
              flatObjectMetadataToValidate: flatObjectMetadata,
              otherFlatObjectMetadataMapsToValidate: toFlatObjectMetadataMaps,
            },
          );

        if (validationErrors.length > 0) {
          return {
            status: 'fail',
            errors: validationErrors,
          };
        }

        optimisticFlatObjectMetadataMaps =
          addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
            flatObjectMetadata: flatObjectMetadata,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
          });

        const createFieldActions = flatObjectMetadata.flatFieldMetadatas.map(
          (flatFieldMetadata) =>
            getWorkspaceMigrationV2FieldCreateAction({
              flatFieldMetadata,
              flatObjectMetadata,
            }),
        );

        const createObjectAction = getWorkspaceMigrationV2ObjectCreateAction({
          flatObjectMetadata,
          createFieldActions,
        });

        return {
          status: 'success',
          result: createObjectAction,
        };
      }),
    );

    const deletedObjectBuildResults =
      buildOptions.inferDeletionFromMissingObjectFieldIndex
        ? deletedFlatObjectMetadata.map<
            MetadataValidateAndBuildResult<WorkspaceMigrationObjectActionV2>
          >((flatObjectMetadataToDelete) => {
            const validationErrors =
              this.flatObjectMetadataValidatorService.validateFlatObjectMetadataDeletion(
                {
                  buildOptions,
                  existingFlatObjectMetadataMaps:
                    optimisticFlatObjectMetadataMaps,
                  objectMetadataToDeleteId: flatObjectMetadataToDelete.id,
                },
              );

            if (validationErrors.length > 0) {
              return {
                status: 'fail',
                errors: validationErrors,
              };
            }

            optimisticFlatObjectMetadataMaps =
              deleteObjectFromFlatObjectMetadataMapsOrThrow({
                objectMetadataId: flatObjectMetadataToDelete.id,
                flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
              });

            const deleteObjectAction =
              getWorkspaceMigrationV2ObjectDeleteAction(
                flatObjectMetadataToDelete,
              );

            return {
              status: 'success',
              result: deleteObjectAction,
            };
          })
        : [];

    const updatedObjectBuildResults = updatedFlatObjectMetadata.flatMap<
      MetadataValidateAndBuildResult<WorkspaceMigrationObjectActionV2>
    >(({ from: fromFlatObjectMetadata, to: toFlatObjectMetadata }) => {
      const objectUpdatedProperties = compareTwoFlatObjectMetadata({
        from: fromFlatObjectMetadata,
        to: toFlatObjectMetadata,
      });

      if (objectUpdatedProperties.length === 0) {
        return [];
      }

      const validationErrors =
        this.flatObjectMetadataValidatorService.validateFlatObjectMetadataUpdate(
          {
            existingFlatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            updatedFlatObjectMetadata: toFlatObjectMetadata,
          },
        );

      if (validationErrors.length > 0) {
        return {
          status: 'fail',
          errors: validationErrors,
        };
      }

      optimisticFlatObjectMetadataMaps =
        replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
          flatObjectMetadata: toFlatObjectMetadata,
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
        });

      const updateObjectAction: UpdateObjectAction = {
        type: 'update_object',
        objectMetadataId: toFlatObjectMetadata.id,
        updates: objectUpdatedProperties,
      };

      return {
        status: 'success',
        result: updateObjectAction,
      };
    });

    return {
      optimisticFlatObjectMetadataMaps,
      results: fromMetadataBuildResultsToFailedAndSuccessfulMetadataBuildRecord(
        [
          ...createdObjectBuildResults,
          ...deletedObjectBuildResults,
          ...updatedObjectBuildResults,
        ],
      ),
    };
  }
}
