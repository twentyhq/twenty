import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';

export type FlatIndexMetadata = Partial<
  Omit<IndexMetadataEntity, 'indexFieldMetadatas' | 'objectMetadata'> // Might have an issue as ObjectMetadataId != uniqueIdentifier
> & {
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
  uniqueIdentifier: string;
};
