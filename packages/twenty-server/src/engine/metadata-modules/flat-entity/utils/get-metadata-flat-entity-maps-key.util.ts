import { capitalize } from 'twenty-shared/utils';

import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export const getMetadataFlatEntityMapsKey = <T extends AllMetadataName>(
  metadataName: T,
): MetadataToFlatEntityMapsKey<T> =>
  `flat${capitalize(metadataName)}Maps` as MetadataToFlatEntityMapsKey<T>;
