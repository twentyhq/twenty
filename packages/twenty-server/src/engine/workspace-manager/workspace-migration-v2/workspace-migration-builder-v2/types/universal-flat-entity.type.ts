import { CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { ExtractEntityManyToOneRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-relation-properties.type';
import { ExtractEntityOneToManyRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-relation-properties.type';
import { ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/remove-suffix.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

export type UniversalFlatEntityFrom<TEntity extends SyncableEntity> = Omit<
  TEntity,
  | `${ExtractEntityManyToOneRelationProperties<TEntity> & string}Id`
  | ExtractEntityRelatedSyncableEntityProperties<TEntity>
  | 'application'
  | 'workspaceId'
  | 'applicationId'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityManyToOneRelationProperties<TEntity> &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifier`]: string;
  } & {
    [P in ExtractEntityOneToManyRelationProperties<TEntity> &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifiers`]: string[];
  };
