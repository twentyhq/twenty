import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityDivergenceReportedPropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

type ExtractUniversalProperty<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : P;

export type MetadataUniversalFlatEntityPropertiesToReportDivergence<
  T extends AllMetadataName,
  MetadataConfig =
    (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
  TDivergenceReportedKeys extends keyof MetadataConfig =
    MetadataEntityDivergenceReportedPropertyName<T> & keyof MetadataConfig,
> = {
  [P in TDivergenceReportedKeys]: ExtractUniversalProperty<MetadataConfig, P>;
}[TDivergenceReportedKeys] &
  keyof MetadataUniversalFlatEntity<T>;
