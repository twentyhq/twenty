import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type NonNullableProperties } from 'src/types/non-nullable-properties.type';

export type SyncableEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<SyncableEntity, ApplicationEntity>;

export interface FlatEntity
  extends NonNullableProperties<
    Omit<SyncableEntity, SyncableEntityRelationProperties | 'applicationId'>
  > {
  id: string;
  applicationId: string | null;
}

export type FlatEntityFrom<
  TEntity extends SyncableEntity,
  TEntityRelationProperties extends keyof TEntity,
  TEntityNonNullableDateProperties extends keyof TEntity,
  TEntityNullableDateProperties extends keyof TEntity,
> = FlatEntity &
  Omit<
    TEntity,
    | TEntityRelationProperties
    | TEntityNonNullableDateProperties
    | TEntityNullableDateProperties
    | SyncableEntityRelationProperties
  > & {
    [P in TEntityNonNullableDateProperties]: string;
  } & {
    [P in TEntityNullableDateProperties]: string | null;
  };
