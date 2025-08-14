import { Injectable } from '@nestjs/common';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compareTwoFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { type CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { FailedAndSuccessfulMetadataBuildRecord } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-and-successful-metadata-build-record.type';
import { MetadataBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-build-result.type';
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
import { FromTo } from 'twenty-shared/types';

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
// TODO rename class
export class WorkspaceMigrationV2ObjectActionsBuilder {
  constructor(
    private readonly flatObjectMetadataValidatorService: FlatObjectMetadataValidatorService,
  ) {}

  // TODO rename validateAndBuild
  public async build({
    createdFlatObjectMetadata,
    deletedFlatObjectMetadata,
    updatedFlatObjectMetadata,
    buildOptions,
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
  }: CreatedDeletedUpdatedObjectMetadataInputMatrix): Promise<{
    results: FailedAndSuccessfulMetadataBuildRecord<WorkspaceMigrationObjectActionV2>;
    optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  }> {
    let optimisticFlatObjectMetadataMaps = structuredClone(
      fromFlatObjectMetadataMaps,
    );
    const createdObjectBuildResults = (
      await Promise.all(
        createdFlatObjectMetadata.map<
          Promise<MetadataBuildResult<WorkspaceMigrationObjectActionV2>>
        >(async (flatObjectMetadata) => {
          const validationErrors =
            await this.flatObjectMetadataValidatorService.validateFlatObjectMetadataCreation(
              {
                buildOptions,
                existingFlatObjectMetadataMaps:
                  optimisticFlatObjectMetadataMaps,
                flatObjectMetadataToValidate: flatObjectMetadata,
                otherFlatObjectMetadataMapsToValidate: toFlatObjectMetadataMaps,
              },
            );

          if (validationErrors.length > 0) {
            return {
              status: 'failed',
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
      )
    ).flat();

    const deletedObjectBuildResults =
      buildOptions.inferDeletionFromMissingObjectFieldIndex
        ? deletedFlatObjectMetadata.map<
            MetadataBuildResult<WorkspaceMigrationObjectActionV2>
          >((flatObjectMetadataToDelete) => {
            // Shouldn't we validate the flatFieldMetadatasToDelete here too or within the validateFlatObjectMetadataDeletion directly ?
            // Standard fields of a custom object cannot be deleted unless we delete the parent custom objects
            const validationErrors =
              this.flatObjectMetadataValidatorService.validateFlatObjectMetadataDeletion(
                {
                  buildOptions,
                  existingFlatObjectMetadataMaps:
                    optimisticFlatObjectMetadataMaps, // Should get updated everytime ?
                  objectMetadataToDeleteId: flatObjectMetadataToDelete.id, // does this makes sense that it's only the id ? we already retrieved the flat
                },
              );

            if (validationErrors.length > 0) {
              return {
                status: 'failed',
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
      MetadataBuildResult<WorkspaceMigrationObjectActionV2>
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
          status: 'failed',
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
