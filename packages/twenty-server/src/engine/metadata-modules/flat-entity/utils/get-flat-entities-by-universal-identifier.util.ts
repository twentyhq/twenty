import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const getFlatEntityByUniversalIdentifier = <T extends FlatEntity>(
  maps: FlatEntityMaps<T>,
  universalIdentifier: string,
): T | undefined => {
  const flatEntityId = maps.idByUniversalIdentifier[universalIdentifier];

  if (!isDefined(flatEntityId)) {
    return;
  }

  return maps.byId[flatEntityId];
};
