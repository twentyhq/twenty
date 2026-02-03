import { AllFlatEntityTypesByMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name";
import { FlatEntityMaps } from "src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type";
import { IsUniversalMigratedMetadata } from "src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/is-universal-migrated-metadata.type";
import { AllMetadataName } from "twenty-shared/metadata";

export type MetadataUniversalFlatEntityMaps<T extends AllMetadataName> =
  FlatEntityMaps<
    IsUniversalMigratedMetadata<T> extends true
      ? AllFlatEntityTypesByMetadataName[T]['universalFlatEntity']
      : AllFlatEntityTypesByMetadataName[T]['flatEntity']
  >;
