import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

type ObjectMetadataRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ObjectMetadataEntity>;

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

export type FlatObjectMetadata = FlatEntityFrom<
  ObjectMetadataEntity,
  ObjectMetadataRelationProperties | 'dataSourceId'
> & {
  fieldMetadataIds: string[];
  indexMetadataIds: string[];
  viewIds: string[];
};
