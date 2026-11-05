export type MetadataTechnicalNamesByUniversalIdentifier = {
  readonly objects: Readonly<
    Record<
      string,
      {
        readonly nameSingular: string;
        readonly namePlural: string;
      }
    >
  >;
  readonly fields: Readonly<Record<string, string>>;
};
