import { AllFlatEntityTypesByMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name";
import { AllMetadataName } from "twenty-shared/metadata";

export type IsUniversalMigratedMetadata<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T]['universalMigrated'] extends true
    ? true
    : false;
