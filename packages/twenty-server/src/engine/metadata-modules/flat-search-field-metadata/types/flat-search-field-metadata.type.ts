import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';

export type FlatSearchFieldMetadata = FlatEntityFrom<SearchFieldMetadataEntity>;
