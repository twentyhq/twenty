import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { ExtractEntityManyToOneSyncableEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-syncable-entity-relation-properties.type';
import { ExtractEntityOneToManySyncableEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-syncabl-entity-relation-properties.type';
import { ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/remove-suffix.type';
import { type NonNullableProperties } from 'src/types/non-nullable-properties.type';

export type SyncableFlatEntity = NonNullableProperties<
  Omit<SyncableEntity, 'application' | 'applicationId'>
> & {
  id: string;
  applicationId: string | null;
};

export type FlatEntityFrom<TEntity> = Omit<
  TEntity,
  | ExtractEntityRelatedSyncableEntityProperties<TEntity>
  | 'application'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityManyToOneSyncableEntityRelationProperties<TEntity> &
      string as RemoveSuffix<P, 's'>]: string;
  } & {
    [P in ExtractEntityOneToManySyncableEntityRelationProperties<TEntity> &
      string as `${RemoveSuffix<P, 's'>}Ids`]: string[];
  };
