import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataSideEffectRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-side-effect-related-metadata-names.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

// The precise, non-optional set of flat entity maps a side-effect handler is
// guaranteed to receive: its own maps plus its foreign-key parents (from
// ALL_MANY_TO_ONE_METADATA_RELATIONS) and its declared side-effect companions
// (ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES). Mirrors the validator
// bundle (MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation) but
// scoped to side-effect needs.
export type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  | MetadataToFlatEntityMapsKey<T>
  | MetadataToFlatEntityMapsKey<MetadataSideEffectRelatedMetadataNames<T>>
>;
