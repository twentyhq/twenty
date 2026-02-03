import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';

export type MetadataUniversalFlatEntity<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T]['universalFlatEntity'];
