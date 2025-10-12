import { AllMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-metadata-name.type";
import { MetadataManyToOneRelatedMetadataNames } from "src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type";
import { MetadataToFlatEntityMapsKey } from "src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key";

export type MetadataRelatedFlatEntityMapsKeys<T extends AllMetadataName> =
  MetadataToFlatEntityMapsKey<MetadataManyToOneRelatedMetadataNames<T>>;
