import { capitalize } from 'twenty-shared/utils';

import { type MetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export const getMetadataFlatEntityMapsKey = <T extends AllMetadataName>(
  metadataName: T,
): MetadataFlatEntityMapsKey<T> =>
  `flat${capitalize(metadataName)}Maps` as MetadataFlatEntityMapsKey<T>;
