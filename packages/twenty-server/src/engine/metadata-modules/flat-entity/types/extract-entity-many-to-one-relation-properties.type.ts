import { SyncableEntity } from "src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface";
import { Relation } from "typeorm";

export type ExtractEntityManyToOneRelationProperties<T extends SyncableEntity> =
  NonNullable<
    {
      [P in keyof T]: NonNullable<T[P]> extends Relation<SyncableEntity>
        ? P
        : never;
    }[keyof T]
  >;
