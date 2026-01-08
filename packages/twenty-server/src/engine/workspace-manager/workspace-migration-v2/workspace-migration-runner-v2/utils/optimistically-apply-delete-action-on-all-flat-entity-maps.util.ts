import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type DeleteAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['actions']['delete'];

export type OptimisticallyApplyDeleteActionOnAllFlatEntityMapsArgs<
  TMetadataName extends AllMetadataName,
> = {
  action: DeleteAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyDeleteActionOnAllFlatEntityMaps = <
  TMetadataName extends AllMetadataName,
>({
  action,
  allFlatEntityMaps,
}: OptimisticallyApplyDeleteActionOnAllFlatEntityMapsArgs<TMetadataName>): AllFlatEntityMaps => {
  switch (action.metadataName) {
    case 'fieldMetadata':
    case 'objectMetadata':
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
    case 'index':
    case 'serverlessFunction':
    case 'cronTrigger':
    case 'databaseEventTrigger':
    case 'routeTrigger':
    case 'viewFilter':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab': {
      const flatEntityToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow<
        MetadataFlatEntity<typeof action.metadataName>
      >({
        flatEntityId: action.entityId,
        flatEntityMaps:
          allFlatEntityMaps[getMetadataFlatEntityMapsKey(action.metadataName)],
      });

      deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatEntityToDelete,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: action.metadataName,
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(action);
    }
  }
};
