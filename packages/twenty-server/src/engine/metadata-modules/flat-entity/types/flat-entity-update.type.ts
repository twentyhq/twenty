import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

type IsUniversalMappedProperty<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : never;

export type FlatEntityUpdate<
  T extends AllMetadataName,
  MetadataPropertyConfig = (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
> = Partial<
  Pick<
    MetadataFlatEntity<T>,
    Extract<keyof MetadataFlatEntity<T>, keyof MetadataPropertyConfig>
  >
> & {
  [K in keyof MetadataPropertyConfig as [
    never,
  ] extends IsUniversalMappedProperty<MetadataPropertyConfig, K>
    ? never
    : IsUniversalMappedProperty<MetadataPropertyConfig, K>]?: never;
};
