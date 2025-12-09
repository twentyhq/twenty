import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

export type IndexMetadataRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    IndexMetadataEntity,
    MetadataEntitiesRelationTarget
  >;

export type IndexFieldMetadataEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    IndexFieldMetadataEntity,
    MetadataEntitiesRelationTarget
  >;

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
