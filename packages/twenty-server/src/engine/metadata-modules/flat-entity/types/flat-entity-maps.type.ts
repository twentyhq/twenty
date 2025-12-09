import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatEntityMaps<T extends SyncableFlatEntity> = {
  byId: Partial<Record<string, T>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};
