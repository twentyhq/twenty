import { MetadataToFlatEntityMapsKey } from "src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key";
import { MetadataUniversalFlatEntityMaps } from "src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type";
import { AllMetadataName } from "twenty-shared/metadata";

export type AllUniversalFlatEntityMaps = {
  [P in AllMetadataName as MetadataToFlatEntityMapsKey<P>]: MetadataUniversalFlatEntityMaps<P>;
};
