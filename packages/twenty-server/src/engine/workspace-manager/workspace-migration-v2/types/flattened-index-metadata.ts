import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { FlattenedIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flattened-index-field-metadata';

export type FlattenedIndexMetadata = Partial<
  Omit<IndexMetadataEntity, 'indexFieldMetadatas' | 'objectMetadata'> // Might have an issue as ObjectMetadataId != uniqueIdentifier
> & {
  flattenedIndexFieldMetadatas: FlattenedIndexFieldMetadata[];
  uniqueIdentifier: string;
};
