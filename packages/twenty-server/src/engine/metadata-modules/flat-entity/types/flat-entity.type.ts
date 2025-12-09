import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ExtractRecordTypeOrmNullableDateProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-non-nullable-date-properties.type';
import { type ExtractRecordTypeOrmNonNullableDateProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-nullable-date-properties.type';
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

export type EntityNullableDateProperties<TEntity> =
  ExtractRecordTypeOrmNullableDateProperties<TEntity>;

export type EntityNonNullableDateProperties<TEntity> =
  ExtractRecordTypeOrmNonNullableDateProperties<TEntity>;

export type FlatEntityFrom<
  TEntity extends SyncableEntity,
  TEntityRelationProperties extends keyof TEntity,
> = FlatEntity &
  Omit<
    TEntity,
    | TEntityRelationProperties
    | EntityNonNullableDateProperties<TEntity>
    | EntityNullableDateProperties<TEntity>
    | SyncableEntityRelationProperties
  > & {
    [P in EntityNonNullableDateProperties<TEntity>]: string;
  } & {
    [P in EntityNullableDateProperties<TEntity>]: string | null;
  };
