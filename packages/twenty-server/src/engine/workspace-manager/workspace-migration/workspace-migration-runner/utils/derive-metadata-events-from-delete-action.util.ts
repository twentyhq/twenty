import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type AllFlatWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { METADATA_EVENTS_TO_EMIT } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/metadata-event-to-emit.constant';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

export type DeriveMetadataEventsFromDeleteActionArgs = {
  flatAction: AllFlatWorkspaceMigrationAction<'delete'>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const deriveMetadataEventsFromDeleteAction = ({
  flatAction,
  allFlatEntityMaps,
}: DeriveMetadataEventsFromDeleteActionArgs): MetadataEvent[] => {
  const events = deriveAllMetadataEventsFromDeleteAction({
    flatAction,
    allFlatEntityMaps,
  });

  return events.filter((event) => METADATA_EVENTS_TO_EMIT[event.metadataName]);
};

const deriveAllMetadataEventsFromDeleteAction = ({
  flatAction,
  allFlatEntityMaps,
}: DeriveMetadataEventsFromDeleteActionArgs): MetadataEvent[] => {
  switch (flatAction.metadataName) {
    case 'fieldMetadata':
    case 'objectMetadata':
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
      const flatEntityToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow<
        MetadataFlatEntity<typeof flatAction.metadataName>
      >({
        flatEntityId: flatAction.entityId,
        flatEntityMaps:
          allFlatEntityMaps[
            getMetadataFlatEntityMapsKey(flatAction.metadataName)
          ],
      });

      return [
        {
          type: 'deleted',
          metadataName: flatAction.metadataName,
          recordId: flatAction.entityId,
          properties: {
            before: flatEntityToScalarFlatEntity({
              flatEntity: flatEntityToDelete,
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
