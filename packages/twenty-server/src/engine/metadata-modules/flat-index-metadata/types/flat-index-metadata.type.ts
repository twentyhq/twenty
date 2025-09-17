import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

export type IndexMetadataRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    IndexMetadataEntity,
    MetadataEntitiesRelationTarget
  >;

export type FlatIndexMetadata = Omit<
  IndexMetadataEntity,
  IndexMetadataRelationProperties
> & {
  universalIdentifier: string;
  flatIndexFieldMetadatas: Omit<
    IndexFieldMetadataEntity,
    ExtractRecordTypeOrmRelationProperties<
      IndexFieldMetadataEntity,
      MetadataEntitiesRelationTarget
    >
  >[];
};
