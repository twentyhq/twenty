import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type IndexMetadataRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<IndexMetadataEntity>;

export type IndexFieldMetadataEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<IndexFieldMetadataEntity>;

export type FlatIndexFieldMetadata = FlatEntityFrom<
  IndexFieldMetadataEntity,
  IndexFieldMetadataEntityRelationProperties
>;

export type FlatIndexMetadata = FlatEntityFrom<
  IndexMetadataEntity,
  IndexMetadataRelationProperties
> & {
  universalIdentifier: string;
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
};
