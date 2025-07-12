import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import { MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

type ObjectMetadataRelationProperties = ExtractRecordTypeOrmRelationProperties<
  ObjectMetadataEntity,
  MetadataEntitiesRelationTarget
>;

export type FlatObjectMetadata = Partial<
  Omit<ObjectMetadataEntity, ObjectMetadataRelationProperties>
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
