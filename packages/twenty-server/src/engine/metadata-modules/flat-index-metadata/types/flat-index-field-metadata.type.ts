import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

type IndexFieldMetadataEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    IndexFieldMetadataEntity,
    MetadataEntitiesRelationTarget
  >;

export type FlatIndexFieldMetadata = Partial<
  Omit<IndexFieldMetadataEntity, IndexFieldMetadataEntityRelationProperties>
> & {
  universalIdentifier: string;
};
