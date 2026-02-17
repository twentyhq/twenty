export type ToUniversalForeignKey<T extends string> =
  T extends `${infer Prefix}Id` ? `${Prefix}UniversalIdentifier` : never;
