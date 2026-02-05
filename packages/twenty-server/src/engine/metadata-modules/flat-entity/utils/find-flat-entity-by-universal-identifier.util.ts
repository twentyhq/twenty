import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const findFlatEntityByUniversalIdentifier = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifier: string;
}): T | undefined => {
  return flatEntityMaps.byUniversalIdentifier[universalIdentifier];
};
