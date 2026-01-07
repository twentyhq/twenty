import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export type FlatIndexFieldMetadata = FlatEntityFrom<IndexFieldMetadataEntity>;

export type FlatIndexMetadata = FlatEntityFrom<IndexMetadataEntity> & {
  universalIdentifier: string;
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
};
