import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type AddSuffixToEntityManyToOneProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-many-to-one-properties.type';
import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';

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
  | keyof (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[TMetadataName]
  | keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName]
  | Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
  | AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TMetadataName>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> &
  UniversalFlatEntityExtraProperties<TEntity, TMetadataName>;
