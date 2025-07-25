import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

type IndexFieldMetadataEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    IndexFieldMetadataEntity,
    MetadataEntitiesRelationTarget
  >;

export type FlatIndexFieldMetadata = Partial<
  Omit<IndexFieldMetadataEntity, IndexFieldMetadataEntityRelationProperties>
> & {
  uniqueIdentifier: string;
};
