import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { MetadataEntitiesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';

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
  uniqueIdentifier: string;
};
