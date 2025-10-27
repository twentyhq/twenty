import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatEntityMaps<T extends FlatEntity> = {
  byId: Partial<Record<string, T>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};

export type FlatEntityMapsV2<T extends FlatEntity> = {
  byUniversalIdentifier: Partial<Record<string, T>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};
