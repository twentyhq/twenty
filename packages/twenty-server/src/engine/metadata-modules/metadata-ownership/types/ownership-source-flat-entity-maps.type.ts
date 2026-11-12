export type OwnershipSourceFlatEntityMaps = {
  byUniversalIdentifier: Partial<
    Record<string, { id: string; [property: string]: unknown }>
  >;
};
