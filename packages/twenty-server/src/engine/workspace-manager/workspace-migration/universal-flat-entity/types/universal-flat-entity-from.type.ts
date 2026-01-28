import { type AllMetadataName } from 'twenty-shared/metadata';

import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { type FormatRecordSerializedRelationProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/format-record-serialized-relation-properties.type';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

// TODO Handle universal settings
export type UniversalFlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  | 'applicationId'
  | 'workspaceId'
  | 'standardId'
  | 'id'
  | ExtractEntityRelatedEntityProperties<TEntity>
  | Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
  | ExtractJsonbProperties<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityOneToManyEntityRelationProperties<
      TEntity,
      SyncableEntity
    > &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifiers`]: string[];
  } & {
    [P in Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity> &
      string as `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`]: TEntity[P];
  } & {
    applicationUniversalIdentifier: string;
  } & {
    [P in ExtractJsonbProperties<TEntity>]: FormatRecordSerializedRelationProperties<
      TEntity[P]
    >;
  };
