import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  type CreateMetadataEvent,
  type MetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export const deriveMetadataEventsFromCreateAction = (
  flatAction: AllFlatWorkspaceMigrationAction<'create'>,
): MetadataEvent[] => {
  switch (flatAction.metadataName) {
    case 'fieldMetadata': {
      return flatAction.flatFieldMetadatas.map(
        (flatFieldMetadata): CreateMetadataEvent<'fieldMetadata'> => ({
          type: 'create',
          metadataName: 'fieldMetadata',
          properties: {
            after: flatFieldMetadata,
          },
        }),
      );
    }
    case 'objectMetadata': {
      const objectEvent: CreateMetadataEvent<'objectMetadata'> = {
        type: 'create',
        metadataName: 'objectMetadata',
        properties: {
          after: flatAction.flatEntity,
        },
      };

      const fieldEvents: MetadataEvent[] = flatAction.flatFieldMetadatas.map(
        (flatFieldMetadata): CreateMetadataEvent<'fieldMetadata'> => ({
          type: 'create',
          metadataName: 'fieldMetadata',
          properties: {
            after: flatFieldMetadata,
          },
        }),
      );

      return [objectEvent, ...fieldEvents];
    }
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
    case 'index':
    case 'logicFunction':
    case 'viewFilter':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab':
    case 'commandMenuItem':
    case 'frontComponent':
    case 'navigationMenuItem':
    case 'webhook': {
      return [
        {
          type: 'create',
          metadataName: flatAction.metadataName,
          properties: {
            after: flatAction.flatEntity,
          },
        },
      ];
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
