import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/remove-suffix.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

export type UniversalFlatEntityFrom<TEntity extends SyncableEntity> = Omit<
  TEntity,
  | `${ExtractEntityManyToOneEntityRelationProperties<TEntity> & string}Id`
  | ExtractEntityRelatedEntityProperties<TEntity>
  | 'application'
  | 'workspaceId'
  | 'applicationId'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityManyToOneEntityRelationProperties<TEntity> &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifier`]: string;
  } & {
    [P in ExtractEntityOneToManyEntityRelationProperties<
      TEntity,
      SyncableEntity
    > &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifiers`]: string[];
  };
