import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

export const objectMetadataEntityRelationProperties = [
  'fields',
  'indexMetadatas',
  'targetRelationFields',
  'dataSource',
  'application',
  'objectPermissions',
  'fieldPermissions',
  'views',
] as const satisfies ObjectMetadataRelationProperties[];

type ObjectMetadataRelationProperties = ExtractRecordTypeOrmRelationProperties<
  ObjectMetadataEntity,
  MetadataEntitiesRelationTarget
>;

export type FlatObjectMetadata = FlatEntityFrom<
  ObjectMetadataEntity,
  ObjectMetadataRelationProperties | 'dataSourceId'
> & {
  fieldMetadataIds: string[];
  indexMetadataIds: string[];
  viewIds: string[];
};
