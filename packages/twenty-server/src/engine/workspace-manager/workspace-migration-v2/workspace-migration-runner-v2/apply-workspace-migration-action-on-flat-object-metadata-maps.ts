import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps.util';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import { deleteObjectFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps.util';
import { dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';
import { dispatchAndReplaceFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-replace-flat-field-metadata-in-flat-object-metadata-maps.util';
import { findFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps.util';
import { findFlatObjectdMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps.util';
import { WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { applyWorkspaceMigrationUpdateActionUpdates } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/apply-workspace-migration-update-action-updates.util';

export const applyWorkspaceMigrationActionOnFlatObjectMetadataMaps = ({
  action,
  flatObjectMetadataMaps,
}: Omit<
  WorkspaceMigrationRunnerArgs,
  'queryRunner'
>): FlatObjectMetadataMaps => {
  switch (action.type) {
    case 'delete_object': {
      return deleteObjectFromFlatObjectMetadataMaps({
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

      return addFlatObjectMetadataToFlatObjectMetadataMaps({
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
        findFlatObjectdMetadataInFlatObjectMetadataMaps({
          objectMetadataId,
          flatObjectMetadataMaps,
        });

      if (!isDefined(existingFlatObjectMetadata)) {
        throw new Error('TODO'); // TODO prastoin handle custom exception
      }
      const updatedFlatObjectMetadata = {
        ...existingFlatObjectMetadata,
        ...applyWorkspaceMigrationUpdateActionUpdates(action),
      };

      return replaceFlatObjectMetadataInFlatObjectMetadataMaps({
        flatObjectMetadata: updatedFlatObjectMetadata,
        flatObjectMetadataMaps,
      });
    }
    case 'create_field': {
      return dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps({
        flatFieldMetadata: action.flatFieldMetadata,
        flatObjectMetadataMaps,
      });
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
        throw new Error('TODO'); // TODO prastoin handle custom exception
      }

      const updatedFlatFieldMetadata = {
        ...existingFlatFieldMetadata,
        ...applyWorkspaceMigrationUpdateActionUpdates(action),
      };

      return dispatchAndReplaceFlatFieldMetadataInFlatObjectMetadataMaps({
        flatFieldMetadata: updatedFlatFieldMetadata,
        flatObjectMetadataMaps,
      });
    }
    case 'delete_field': {
      return deleteFieldFromFlatObjectMetadataMaps({
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
