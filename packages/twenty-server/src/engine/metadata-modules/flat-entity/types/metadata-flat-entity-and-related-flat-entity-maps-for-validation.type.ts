import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type MetadataValidationRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-validation-related-metadata-names.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<
  T extends AllMetadataName,
> = Pick<
  AllUniversalFlatEntityMaps,
  | MetadataRelatedFlatEntityMapsKeys<T>
  | MetadataToFlatEntityMapsKey<T>
  | MetadataToFlatEntityMapsKey<MetadataValidationRelatedMetadataNames<T>>
>;
