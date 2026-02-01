import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type FlatEntityMaps<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  byId: Partial<Record<string, T>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};
