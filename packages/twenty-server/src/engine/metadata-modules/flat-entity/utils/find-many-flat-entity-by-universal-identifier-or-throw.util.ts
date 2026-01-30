import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type FindManyFlatEntityByUniversalIdentifierOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: string[];
};

export const findManyFlatEntityByUniversalIdentifierOrThrow = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifiers,
}: FindManyFlatEntityByUniversalIdentifierOrThrowArgs<T>): (T & {
  id: string;
})[] => {
  const flatEntities: T[] = [];
  const missingUniversalIdentifiers: string[] = [];

  for (const universalIdentifier of universalIdentifiers) {
    const flatEntity = findFlatEntityByUniversalIdentifier({
      flatEntityMaps,
      universalIdentifier,
    });

    if (!isDefined(flatEntity)) {
      missingUniversalIdentifiers.push(universalIdentifier);
    } else {
      flatEntities.push(flatEntity);
    }
  }

  if (missingUniversalIdentifiers.length > 0) {
    throw new FlatEntityMapsException(
      `Could not find flat entities with universal identifiers: ${missingUniversalIdentifiers.join(', ')}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntities;
};
