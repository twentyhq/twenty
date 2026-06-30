import { type SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatSearchFieldMetadata = UniversalFlatEntityFrom<
  SearchFieldMetadataEntity,
  'searchFieldMetadata'
>;
