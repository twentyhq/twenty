import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const findFlatEntityByUniversalIdentifier = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifier: string;
}): T | undefined => {
  const flatEntityId =
    flatEntityMaps.idByUniversalIdentifier[universalIdentifier];

  if (!isDefined(flatEntityId)) {
    return;
  }

  return flatEntityMaps.byId[flatEntityId];
};
