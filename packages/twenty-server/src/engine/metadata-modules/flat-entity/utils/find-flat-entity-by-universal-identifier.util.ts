import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export const findFlatEntityByUniversalIdentifier = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifier: string;
}): T | undefined => {
  return flatEntityMaps.byUniversalIdentifier[universalIdentifier];
};
