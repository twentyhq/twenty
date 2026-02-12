import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const findFlatEntityByUniversalIdentifier = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: {
  flatEntityMaps: UniversalFlatEntityMaps<T>;
  universalIdentifier: string;
}): T | undefined => {
  return flatEntityMaps.byUniversalIdentifier[universalIdentifier];
};
