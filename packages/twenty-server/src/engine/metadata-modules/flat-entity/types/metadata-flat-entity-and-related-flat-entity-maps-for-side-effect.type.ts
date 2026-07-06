import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataSideEffectRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-side-effect-related-metadata-names.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  | MetadataToFlatEntityMapsKey<T>
  | MetadataToFlatEntityMapsKey<MetadataSideEffectRelatedMetadataNames<T>>
>;
