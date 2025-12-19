import { CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';
import { RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/remove-suffix.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

export type UniversalFlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    FromMetadataEntityToMetadataName<TEntity> = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  | ExtractEntityRelatedSyncableEntityProperties<TEntity>
  | 'application'
  | 'workspaceId'
  | 'applicationId'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
  | MetadataManyToOneJoinColumn<TMetadataName>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in MetadataManyToOneJoinColumn<TMetadataName> &
      string as `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`]: P;
  };
