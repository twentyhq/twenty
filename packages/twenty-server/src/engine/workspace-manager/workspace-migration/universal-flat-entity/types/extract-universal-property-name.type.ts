export type ExtractUniversalPropertyName<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : P;
