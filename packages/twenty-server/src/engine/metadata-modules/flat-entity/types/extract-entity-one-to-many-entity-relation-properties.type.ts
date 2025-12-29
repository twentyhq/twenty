import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Relation } from 'typeorm';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type AllNonSyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-syncable-entities.type';

export type ExtractEntityOneToManyEntityRelationProperties<
  T,
  TTarget = MetadataEntity<AllMetadataName> | AllNonSyncableEntity,
> = NonNullable<
  {
    [P in keyof T]: NonNullable<T[P]> extends Array<Relation<TTarget>>
      ? P
      : never;
  }[keyof T]
>;
