// TODO
export type UniversalFlatEntityMaps<T extends object> = {
  byUniversalIdentifier: Partial<Record<string, T>>;
  universalIdentifierById: Partial<Record<string, string>>;
  universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
};
