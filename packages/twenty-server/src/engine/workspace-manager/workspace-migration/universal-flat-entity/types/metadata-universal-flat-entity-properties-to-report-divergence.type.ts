import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityNonComparablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type SERVER_MANAGED_FLAT_ENTITY_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/server-managed-flat-entity-properties.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type ExtractUniversalPropertyName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-universal-property-name.type';

export type MetadataUniversalFlatEntityPropertiesToReportDivergence<
  T extends AllMetadataName,
  MetadataConfig =
    (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
  TDivergenceReportedKeys extends keyof MetadataConfig = Exclude<
    MetadataEntityNonComparablePropertyName<T>,
    (typeof SERVER_MANAGED_FLAT_ENTITY_PROPERTIES)[number]
  > &
    keyof MetadataConfig,
> = {
  [P in TDivergenceReportedKeys]: ExtractUniversalPropertyName<
    MetadataConfig,
    P
  >;
}[TDivergenceReportedKeys] &
  keyof MetadataUniversalFlatEntity<T>;
