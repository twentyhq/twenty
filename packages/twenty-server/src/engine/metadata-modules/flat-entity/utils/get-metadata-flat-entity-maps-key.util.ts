import { capitalize } from 'twenty-shared/utils';

import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type MetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';

export const getMetadataFlatEntityMapsKey = <T extends AllMetadataName>(
  metadataName: T,
): MetadataFlatEntityMapsKey<T> =>
  `flat${capitalize(metadataName)}Maps` as MetadataFlatEntityMapsKey<T>;
