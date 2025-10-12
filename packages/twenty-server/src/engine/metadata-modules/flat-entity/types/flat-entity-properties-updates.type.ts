import { type ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type FlatEntityPropertiesUpdates<T extends AllMetadataName> = Array<
  PropertyUpdate<
    MetadataFlatEntity<T>,
    Extract<
      (typeof ALL_FLAT_ENTITY_CONFIGURATION)[T]['propertiesToCompare'][number],
      keyof MetadataFlatEntity<T>
    >
  >
>;

