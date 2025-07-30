import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

export const objectMetadataEntityRelationProperties = [
  'fields',
  'indexMetadatas',
  'targetRelationFields',
  'dataSource',
  'objectPermissions',
  'fieldPermissions',
] as const satisfies ObjectMetadataRelationProperties[];

type ObjectMetadataRelationProperties = ExtractRecordTypeOrmRelationProperties<
  ObjectMetadataEntity,
  MetadataEntitiesRelationTarget
>;

export type FlatObjectMetadata = Omit<
  ObjectMetadataEntity,
  | ObjectMetadataRelationProperties
  | 'dataSourceId'
  | 'createdAt'
  | 'updatedAt'
  | 'duplicateCriteria'
> & {
  uniqueIdentifier: string;
  flatIndexMetadatas: FlatIndexMetadata[];
  flatFieldMetadatas: FlatFieldMetadata[];
};

// Could be renamed
export type FlatObjectMetadataWithoutFields = Omit<
  FlatObjectMetadata,
  'flatFieldMetadatas' | 'flatIndexMetadatas'
>;
