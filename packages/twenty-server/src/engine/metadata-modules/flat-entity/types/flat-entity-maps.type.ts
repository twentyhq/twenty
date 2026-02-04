import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatEntityMaps<T extends SyncableFlatEntity> = {
  byUniversalIdentifier: Partial<Record<string, T>>;
  universalIdentifierById: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};
