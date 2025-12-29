import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Relation } from 'typeorm';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type AllNonSyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-syncable-entities.type';

export type ExtractEntityOneToManyEntityRelationProperties<T> = NonNullable<
  {
    [P in keyof T]: NonNullable<T[P]> extends Array<
      Relation<MetadataEntity<AllMetadataName> | AllNonSyncableEntity>
    >
      ? P
      : never;
  }[keyof T]
>;
