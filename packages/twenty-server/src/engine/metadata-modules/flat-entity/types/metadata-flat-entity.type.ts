import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataFlatEntity<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T]['flatEntity'];
