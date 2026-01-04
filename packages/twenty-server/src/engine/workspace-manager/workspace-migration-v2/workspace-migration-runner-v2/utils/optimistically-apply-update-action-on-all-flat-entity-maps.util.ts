import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

type UpdateAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['actions']['update'];

export type OptimisticallyApplyUpdateActionOnAllFlatEntityMapsArgs<
  TMetadataName extends AllMetadataName,
> = {
  action: UpdateAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyUpdateActionOnAllFlatEntityMaps = <
  TMetadataName extends AllMetadataName,
>({
  action,
  allFlatEntityMaps,
}: OptimisticallyApplyUpdateActionOnAllFlatEntityMapsArgs<TMetadataName>): AllFlatEntityMaps => {
  switch (action.metadataName) {
    case 'index': {
      const flatIndex = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: action.entityId,
        flatEntityMaps: allFlatEntityMaps['flatIndexMaps'],
      });

      deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatIndex,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: action.metadataName,
      });

      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: action.updatedFlatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: action.metadataName,
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
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(
        action.metadataName,
      );
      const fromFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow<
        MetadataFlatEntity<typeof action.metadataName>
      >({
        flatEntityId: action.entityId,
        flatEntityMaps: allFlatEntityMaps[flatEntityMapsKey],
      });

      const toFlatEntity = {
        ...fromFlatEntity,
        ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
      };

      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: toFlatEntity,
        flatEntityMapsToMutate: allFlatEntityMaps[flatEntityMapsKey],
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(action);
    }
  }
};
