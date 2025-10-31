import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

type ExtractRelationIdProperties<T> = {
  [K in keyof T]: K extends `${infer _}Id`
    ? K extends 'id' | 'workspaceId' | 'standardId'
      ? never
      : T[K] extends string | null | undefined
        ? K
        : never
    : never;
}[keyof T];

type PropertyNameToRelationName<T extends string> = T extends `${infer Name}Id`
  ? Name
  : never;

type ExtractEntityRelations<TEntity> = {
  [K in ExtractRelationIdProperties<TEntity> as PropertyNameToRelationName<K>]: K;
};

export type MetadataNameAndRelations = {
  [T in AllMetadataName]: Partial<ExtractEntityRelations<MetadataEntity<T>>>;
};
