import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type NonNullableProperties } from 'src/types/non-nullable-properties.type';

export type SyncableFlatEntity = NonNullableProperties<
  Omit<SyncableEntity, 'application' | 'applicationId'>
> & {
  id: string;
  applicationId: string | null;
};

export type FlatEntityFrom<
  TEntity,
  TEntityRelationProperties extends keyof TEntity,
> = Omit<
  TEntity,
  | TEntityRelationProperties
  | 'application'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity>;
