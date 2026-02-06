import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export type FlatIndexFieldMetadata = FlatEntityFrom<IndexFieldMetadataEntity>;

// TODO find a smooth way to handle this
export type FlatIndexMetadata = FlatEntityFrom<IndexMetadataEntity> & {
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
};
