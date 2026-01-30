import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export type FindFlatEntityByUniversalIdentifierOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifier: string;
};

export const findFlatEntityByUniversalIdentifierOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: FindFlatEntityByUniversalIdentifierOrThrowArgs<T>): T => {
  const flatEntity = findFlatEntityByUniversalIdentifier({
    flatEntityMaps,
    universalIdentifier,
  });

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      `Could not find flat entity with universal identifier ${universalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity;
};
