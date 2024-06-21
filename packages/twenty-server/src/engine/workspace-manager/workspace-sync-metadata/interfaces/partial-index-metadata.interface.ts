import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export type PartialIndexMetadata = Omit<
  IndexMetadataEntity,
  'id' | 'expression' | 'objectMetadata' | 'indexFieldMetadatas'
> & {
  columns: string[];
};
