import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { type MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

type IndexMetadataRelationProperties = ExtractRecordTypeOrmRelationProperties<
  IndexMetadataEntity,
  MetadataEntitiesRelationTarget
>;

// TODO prastoin refactor FlatIndexMetadata to not be a Partial extension of IndexMetadataEntity
export type FlatIndexMetadata = Partial<
  Omit<IndexMetadataEntity, IndexMetadataRelationProperties>
> & {
  id: string;
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
  universalIdentifier: string;
};
