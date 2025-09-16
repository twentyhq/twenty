import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

export type IndexFieldMetadataRelationProperties = ExtractRecordTypeOrmRelationProperties<
  IndexFieldMetadataEntity,
  MetadataEntitiesRelationTarget
>;

export type FlatIndexFieldMetadata = Omit<
  IndexFieldMetadataEntity,
  IndexFieldMetadataRelationProperties
> & {
  universalIdentifier: string;
};