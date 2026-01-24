import { type AllMetadataName } from 'twenty-shared/metadata';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';
import {
  ExtractJsonbProperties,
  ExtractSerializedRelationProperties,
  HasJsonbPropertyBrand,
  JSONB_PROPERTY_BRAND,
} from 'twenty-shared/types';

type FormatRecordSerializedRelation<T> = T extends unknown
  ? HasJsonbPropertyBrand<T> extends true
    ? Omit<
        {
          [P in keyof T as P extends ExtractSerializedRelationProperties<T> &
            string
            ? `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`
            : P]: T[P];
        },
        typeof JSONB_PROPERTY_BRAND
      >
    : T
  : never;

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
    [P in ExtractJsonbProperties<TEntity>]: FormatRecordSerializedRelation<
      TEntity[P]
    >;
  };

type tmp = ExtractJsonbProperties<FieldMetadataEntity>;
