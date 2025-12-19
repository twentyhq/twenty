import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';
import { type Relation } from 'typeorm';

export type ExtractEntityRelatedSyncableEntityProperties<T> =
  NonNullable<
    {
      [P in keyof T]: NonNullable<T[P]> extends Relation<
        SyncableEntity
      >
        ? P
        : never;
    }[keyof T]
  >;
