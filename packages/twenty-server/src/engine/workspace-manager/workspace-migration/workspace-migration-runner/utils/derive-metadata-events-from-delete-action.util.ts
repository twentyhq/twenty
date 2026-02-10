import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

// TODO prastoin create util type
type FlatDeleteAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['flatActions']['delete'];

export type DeriveMetadataEventsFromDeleteActionArgs<
  TMetadataName extends AllMetadataName,
> = {
  flatAction: FlatDeleteAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const deriveMetadataEventsFromDeleteAction = <
  TMetadataName extends AllMetadataName,
>({
  flatAction,
  allFlatEntityMaps,
}: DeriveMetadataEventsFromDeleteActionArgs<TMetadataName>): MetadataEvent[] => {
  switch (flatAction.metadataName) {
    case 'fieldMetadata':
    case 'objectMetadata':
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
          type: 'delete',
          metadataName: flatAction.metadataName,
          properties: {
            before: flatEntityToDelete,
          },
        } as MetadataEvent,
      ];
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
