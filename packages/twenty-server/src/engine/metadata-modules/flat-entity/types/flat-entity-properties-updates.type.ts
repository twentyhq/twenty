import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type FlatEntityPropertiesUpdates<
  T extends AllMetadataName,
  K extends FlatEntityPropertiesToCompare<T> = FlatEntityPropertiesToCompare<T>,
> = Array<
  PropertyUpdate<MetadataFlatEntity<T>, Extract<K, keyof MetadataFlatEntity<T>>>
>;
