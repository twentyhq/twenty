import { type MetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { capitalize } from 'twenty-shared/utils';

export const getMetadataFlatEntityMapsKey = <T extends AllMetadataName>(
  metadataName: T,
): MetadataFlatEntityMapsKey<T> =>
  `flat${capitalize(metadataName)}Maps` as MetadataFlatEntityMapsKey<T>;
