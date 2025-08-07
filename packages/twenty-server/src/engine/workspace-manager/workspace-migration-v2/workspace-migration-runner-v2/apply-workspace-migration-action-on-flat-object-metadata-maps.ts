import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { findFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps.util';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner.exception';

export const applyWorkspaceMigrationActionOnFlatObjectMetadataMaps = ({
  action,
  flatObjectMetadataMaps,
}: Omit<
  WorkspaceMigrationRunnerArgs,
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
    case 'create_field': {
      const updatedFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: action.flatFieldMetadata,
          flatObjectMetadataMaps,
        });

      if (!isDefined(updatedFlatObjectMetadataMaps)) {
        throw new WorkspaceMigrationRunnerException(
          `Workspace migration failed: dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps failed`,
          WorkspaceMigrationRunnerExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      return updatedFlatObjectMetadataMaps;
    }
    case 'update_field': {
      const { fieldMetadataId, objectMetadataId } = action;
      const existingFlatFieldMetadata =
        findFlatFieldMetadataInFlatObjectMetadataMaps({
          fieldMetadataId,
          objectMetadataId,
          flatObjectMetadataMaps,
        });

      if (!isDefined(existingFlatFieldMetadata)) {
        throw new WorkspaceMigrationRunnerException(
          `Workspace migration failed: Field metadata not found in cache`,
          WorkspaceMigrationRunnerExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      const updatedFlatFieldMetadata = {
        ...existingFlatFieldMetadata,
        ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
      };

      const updatedFlatObjectMetadataMaps =
        replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: updatedFlatFieldMetadata,
          flatObjectMetadataMaps,
        });

      if (!isDefined(updatedFlatObjectMetadataMaps)) {
        throw new WorkspaceMigrationRunnerException(
          `Workspace migration failed: dispatchAndReplaceFlatFieldMetadataInFlatObjectMetadataMaps failed`,
          WorkspaceMigrationRunnerExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      return updatedFlatObjectMetadataMaps;
    }
    case 'delete_field': {
      return deleteFieldFromFlatObjectMetadataMapsOrThrow({
        fieldMetadataId: action.fieldMetadataId,
        flatObjectMetadataMaps,
        objectMetadataId: action.objectMetadataId,
      });
    }
    case 'create_index': {
      // TODO prastoin handle indexes
      return flatObjectMetadataMaps;
    }
    case 'delete_index': {
      // TODO prastoin handle indexes
      return flatObjectMetadataMaps;
    }
    default: {
      assertUnreachable(
        action,
        'Should never occur, encountered an unsupported workspace migration action type',
      );
    }
  }
};
