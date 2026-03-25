import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export type FindManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  flatEntityMaps: UniversalFlatEntityMaps<T>;
  universalIdentifiers: string[];
};

export const findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps =
  <T extends SyncableFlatEntity | UniversalSyncableFlatEntity>({
    flatEntityMaps,
    universalIdentifiers,
  }: FindManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsArgs<T>): T[] =>
    universalIdentifiers
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps,
          universalIdentifier,
        }),
      )
      .filter(isDefined);
