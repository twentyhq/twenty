import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { FlattenIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';

export type FlattenIndexMetadata = Partial<
  Omit<IndexMetadataEntity, 'indexFieldMetadatas' | 'objectMetadata'> // Might have an issue as ObjectMetadataId != uniqueIdentifier
> & {
  flattenIndexFieldMetadatas: FlattenIndexFieldMetadata[];
  uniqueIdentifier: string;
};
