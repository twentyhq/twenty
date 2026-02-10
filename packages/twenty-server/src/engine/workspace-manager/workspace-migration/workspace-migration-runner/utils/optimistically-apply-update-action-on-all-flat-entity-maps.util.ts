import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

type FlatUpdateAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['flatActions']['update'];

export type OptimisticallyApplyUpdateActionOnAllFlatEntityMapsArgs<
  TMetadataName extends AllMetadataName,
> = {
  flatAction: FlatUpdateAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyUpdateActionOnAllFlatEntityMaps = <
  TMetadataName extends AllMetadataName,
>({
  flatAction,
  allFlatEntityMaps,
}: OptimisticallyApplyUpdateActionOnAllFlatEntityMapsArgs<TMetadataName>): AllFlatEntityMaps => {
  switch (flatAction.metadataName) {
    case 'index': {
      const flatIndex = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatAction.entityId,
        flatEntityMaps: allFlatEntityMaps['flatIndexMaps'],
      });

      deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatIndex,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: flatAction.metadataName,
      });

      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatAction.updatedFlatIndex,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: flatAction.metadataName,
      });

      return allFlatEntityMaps;
    }
    case 'fieldMetadata':
    case 'objectMetadata':
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
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
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(
        flatAction.metadataName,
      );
      const fromFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow<
        MetadataFlatEntity<typeof flatAction.metadataName>
      >({
        flatEntityId: flatAction.entityId,
        flatEntityMaps: allFlatEntityMaps[flatEntityMapsKey],
      });

      const toFlatEntity = {
        ...fromFlatEntity,
        ...flatAction.update,
      };

      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: toFlatEntity,
        flatEntityMapsToMutate: allFlatEntityMaps[flatEntityMapsKey],
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
