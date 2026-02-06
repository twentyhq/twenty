import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AddSuffixToEntityManyToOneProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-many-to-one-properties.type';
import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';
import { type FormatRecordSerializedRelationProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/format-record-serialized-relation-properties.type';

export type UniversalSyncableFlatEntity = Omit<
  SyncableEntity,
  'application' | 'applicationId' | 'workspace' | 'workspaceId'
> & {
  applicationUniversalIdentifier: string;
};

export type UniversalFlatEntityExtraProperties<
  TEntity extends SyncableEntity,
  // Required to be passed for narrowed type
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = AddSuffixToEntityOneToManyProperties<TEntity, 'universalIdentifiers'> &
  AddSuffixToEntityManyToOneProperties<
    TEntity,
    TMetadataName,
    'universalIdentifier'
  > & {
    applicationUniversalIdentifier: string;
  } & {
    [P in AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TMetadataName> &
      keyof TEntity &
      string as `universal${Capitalize<P>}`]: FormatRecordSerializedRelationProperties<
      TEntity[P]
    >;
  };

export type UniversalFlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  | 'applicationId'
  | 'workspaceId'
  | 'id'
  | ExtractEntityRelatedEntityProperties<TEntity>
  | Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
  | AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TMetadataName>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> &
  UniversalFlatEntityExtraProperties<TEntity, TMetadataName>;
