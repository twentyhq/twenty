import { assertUnreachable } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import { deleteObjectFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps.util';
import { WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';

export const runWorkspaceMigrationActionOptimistically = ({
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
      return flatObjectMetadataMaps;
    }
    case 'update_object': {
      return flatObjectMetadataMaps;
    }
    case 'create_field': {
      return flatObjectMetadataMaps;
    }
    case 'update_field': {
      return flatObjectMetadataMaps;
    }
    case 'delete_field': {
      return deleteFieldFromFlatObjectMetadataMaps({
        fieldMetadataId: action.fieldMetadataId,
        flatObjectMetadataMaps,
        objectMetadataId: action.objectMetadataId,
      });
    }
    case 'create_index': {
      return flatObjectMetadataMaps;
    }
    case 'delete_index': {
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
