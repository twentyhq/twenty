import { AllFlatEntityTypesByMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name";
import { AllMetadataName } from "twenty-shared/metadata";

export type FromUniversalFlatEntityToMetadataName<T> = {
  [K in AllMetadataName]: AllFlatEntityTypesByMetadataName[K]['universalFlatEntity'] extends T
    ? K
    : never;
}[AllMetadataName];
