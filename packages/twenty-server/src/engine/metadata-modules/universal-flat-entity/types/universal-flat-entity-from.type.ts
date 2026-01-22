import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

export type UniversalFlatEntityFrom<TEntity extends SyncableEntity> = Omit<
  TEntity,
  | 'applicationId'
  | ExtractEntityRelatedEntityProperties<TEntity>
  | Extract<
      MetadataManyToOneJoinColumn<FromMetadataEntityToMetadataName<TEntity>>,
      keyof TEntity
    >
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in Omit<
      ExtractEntityManyToOneEntityRelationProperties<FieldMetadataEntity>,
      'workspace'
    > &
      string as `${P}UniversalIdentifier`]: string;
  } & {
    [P in ExtractEntityOneToManyEntityRelationProperties<
      TEntity,
      SyncableEntity
    > &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifiers`]: string[];
  } & {
    [P in Extract<
      MetadataManyToOneJoinColumn<FromMetadataEntityToMetadataName<TEntity>>,
      keyof TEntity
    > &
      string as `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`]: string;
  };
