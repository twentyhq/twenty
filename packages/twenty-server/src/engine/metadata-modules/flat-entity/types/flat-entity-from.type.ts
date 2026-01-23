import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';
import { type NonNullableProperties } from 'src/types/non-nullable-properties.type';

export type SyncableFlatEntity = NonNullableProperties<
  Omit<SyncableEntity, 'application' | 'applicationId' | 'workspace'>
> & {
  id: string;
  applicationId: string | null;
};

export type FlatEntityFrom<TEntity> = Omit<
  TEntity,
  | ExtractEntityRelatedEntityProperties<TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityOneToManyEntityRelationProperties<
      TEntity,
      SyncableEntity
    > &
      string as `${RemoveSuffix<P, 's'>}Ids`]: string[];
  };
