export type FlatEntityMapsByUniversalIdentifier = {
  byUniversalIdentifier: Partial<
    Record<string, { universalIdentifier: string } & Record<string, unknown>>
  >;
};
