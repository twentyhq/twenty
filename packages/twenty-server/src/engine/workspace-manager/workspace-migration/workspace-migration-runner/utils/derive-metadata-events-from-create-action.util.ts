import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  type CreateMetadataEvent,
  type MetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

export const deriveMetadataEventsFromCreateAction = (
  flatAction: AllFlatWorkspaceMigrationAction<'create'>,
): MetadataEvent[] => {
  switch (flatAction.metadataName) {
    case 'fieldMetadata': {
      return flatAction.flatFieldMetadatas.map(
        (flatFieldMetadata): CreateMetadataEvent<'fieldMetadata'> => ({
          type: 'created',
          recordId: flatFieldMetadata.id,
          metadataName: 'fieldMetadata',
          properties: {
            after: flatEntityToScalarFlatEntity({
              flatEntity: flatFieldMetadata,
              metadataName: 'fieldMetadata',
            }),
          },
        }),
      );
    }
    case 'objectMetadata': {
      const objectEvent: CreateMetadataEvent<'objectMetadata'> = {
        type: 'created',
        metadataName: 'objectMetadata',
        recordId: flatAction.flatEntity.id,
        properties: {
          after: flatEntityToScalarFlatEntity({
            flatEntity: flatAction.flatEntity,
            metadataName: 'objectMetadata',
          }),
        },
      };

      const fieldEvents: MetadataEvent[] = flatAction.flatFieldMetadatas.map(
        (flatFieldMetadata): CreateMetadataEvent<'fieldMetadata'> => ({
          type: 'created',
          recordId: flatFieldMetadata.id,
          metadataName: 'fieldMetadata',
          properties: {
            after: flatEntityToScalarFlatEntity({
              flatEntity: flatFieldMetadata,
              metadataName: 'fieldMetadata',
            }),
          },
        }),
      );

      return [objectEvent, ...fieldEvents];
    }
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'viewFieldGroup':
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
          type: 'created',
          recordId: flatAction.flatEntity.id,
          metadataName: flatAction.metadataName,
          properties: {
            after: flatEntityToScalarFlatEntity({
              flatEntity: flatAction.flatEntity,
              metadataName: flatAction.metadataName,
            }),
          },
        },
      ];
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
