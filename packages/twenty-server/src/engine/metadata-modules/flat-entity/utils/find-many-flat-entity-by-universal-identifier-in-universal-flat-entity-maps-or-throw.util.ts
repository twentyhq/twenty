import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type FindManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: string[];
};

export const findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow =
  <T extends SyncableFlatEntity | UniversalSyncableFlatEntity>({
    flatEntityMaps,
    universalIdentifiers,
  }: FindManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrowArgs<T>): T[] =>
    universalIdentifiers.map((universalIdentifier) =>
      findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps,
        universalIdentifier,
      }),
    );
