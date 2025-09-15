import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

export const applyWorkspaceMigrationActionOnFlatObjectMetadataMaps = <
  T extends WorkspaceMigrationActionV2,
>({
  action,
  allFlatEntityMaps: flatObjectMetadataMaps,
}: Omit<
  WorkspaceMigrationActionRunnerArgs<T>,
  'queryRunner'
>): FlatObjectMetadataMaps => {
  switch (action.type) {
    case 'delete_object': {
      return deleteObjectFromFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: action.objectMetadataId,
      });
    }
    case 'create_object': {
      const flatObjectMetadataWithoutFields =
        action.flatObjectMetadataWithoutFields;
      const flatFieldMetadatas = action.createFieldActions.map(
        (createFieldAction) => createFieldAction.flatFieldMetadata,
      );

      return addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: {
          ...flatObjectMetadataWithoutFields,
          flatIndexMetadatas: [],
          flatFieldMetadatas,
        },
        flatObjectMetadataMaps,
      });
    }
    case 'update_object': {
      const { objectMetadataId } = action;
      const existingFlatObjectMetadata =
        findFlatObjectMetadataInFlatObjectMetadataMaps({
          objectMetadataId,
          flatObjectMetadataMaps,
        });

      if (!isDefined(existingFlatObjectMetadata)) {
        throw new WorkspaceMigrationRunnerException(
          `Workspace migration failed: Object metadata not found in cache`,
          WorkspaceMigrationRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }
      const updatedFlatObjectMetadata = {
        ...existingFlatObjectMetadata,
        ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
      };

      return replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: updatedFlatObjectMetadata,
        flatObjectMetadataMaps,
      });
    }
    case 'create_index':
    case 'delete_index':
    case 'create_view':
    case 'update_view':
    case 'delete_view':
    case 'create_view_field':
    case 'update_view_field':
    case 'delete_view_field':
      return flatObjectMetadataMaps;
    default: {
      assertUnreachable(
        action,
        'Should never occur, encountered an unsupported workspace migration action type',
      );
    }
  }
};
