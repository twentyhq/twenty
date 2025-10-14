import { AllMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-metadata-name.type";
import { FlatEntityPropertiesToCompare } from "src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type";
import { MetadataFlatEntity } from "src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type";
import { PropertyUpdate } from "src/engine/workspace-manager/workspace-migration-v2/types/property-update.type";

export type FlatEntityPropertyUpdate<
  T extends AllMetadataName,
  K extends FlatEntityPropertiesToCompare<T> = FlatEntityPropertiesToCompare<T>,
> = PropertyUpdate<
  MetadataFlatEntity<T>,
  Extract<K, keyof MetadataFlatEntity<T>>
>;
