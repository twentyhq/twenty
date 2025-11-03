import { AllFlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type";
import { MetadataRelatedFlatEntityMapsKeys } from "src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type";
import { MetadataToFlatEntityMapsKey } from "src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key";
import { MetadataValidationRelatedMetadataNames } from "src/engine/metadata-modules/flat-entity/types/metadata-validation-related-metadata-names.type";
import { AllMetadataName } from "twenty-shared/metadata";

export type MetadataFlatEntityAndRelatedFlatEntityMapsForValidation<T extends AllMetadataName> = Pick<
  AllFlatEntityMaps,
  | MetadataRelatedFlatEntityMapsKeys<T>
  | MetadataToFlatEntityMapsKey<T>
  | MetadataToFlatEntityMapsKey<MetadataValidationRelatedMetadataNames<T>>
>;
