import { SyncableEntity } from "src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface";
import { Relation } from "typeorm";

export type ExtractEntityOneToManySyncableEntityRelationProperties<T> =
  NonNullable<
    {
      [P in keyof T]: NonNullable<T[P]> extends Array<Relation<SyncableEntity>>
        ? P
        : never;
    }[keyof T]
  >;
