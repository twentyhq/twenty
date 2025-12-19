import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { ExtractEntityManyToOneRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-relation-properties.type';
import { ExtractEntityOneToManyRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-relation-properties.type';
import { ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/remove-suffix.type';
import { type NonNullableProperties } from 'src/types/non-nullable-properties.type';

export type SyncableFlatEntity = NonNullableProperties<
  Omit<SyncableEntity, 'application' | 'applicationId'>
> & {
  id: string;
  applicationId: string | null;
};

export type FlatEntityFrom<TEntity extends SyncableEntity> = Omit<
  TEntity,
  | ExtractEntityRelatedSyncableEntityProperties<TEntity>
  | 'application'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityManyToOneRelationProperties<TEntity> &
      string as RemoveSuffix<P, 's'>]: string;
  } & {
    [P in ExtractEntityOneToManyRelationProperties<TEntity> &
      string as `${RemoveSuffix<P, 's'>}Ids`]: string[];
  };
