import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FindFlatEntityByIdInFlatEntityMapsOrThrowArgs } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

export const findFlatEntityByIdInFlatEntityMaps = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityId,
}: FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>): T | undefined => {
  const universalIdentifier =
    flatEntityMaps.universalIdentifierById[flatEntityId];

  if (!isDefined(universalIdentifier)) {
    return undefined;
  }

  return flatEntityMaps.byUniversalIdentifier[universalIdentifier];
};
