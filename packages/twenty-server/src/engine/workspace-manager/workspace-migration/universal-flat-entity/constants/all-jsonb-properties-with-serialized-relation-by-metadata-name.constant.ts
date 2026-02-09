import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';

/**
 * Important notice: This file is not strictly typed and needs manual referencement
 * of jsonb properties that may contain a serialized relation
 */
export const ALL_JSONB_PROPERTIES_WITH_SERIALIZED_RELATION_BY_METADATA_NAME = {
  fieldMetadata: {
    settings: 'settings',
  },
  objectMetadata: {},
  view: {},
  viewField: {},
  viewGroup: {},
  viewFilter: {},
  viewFilterGroup: {},
  index: {},
  role: {},
  roleTarget: {},
  rowLevelPermissionPredicate: {},
  rowLevelPermissionPredicateGroup: {},
  logicFunction: {},
  webhook: {},
  agent: {},
  skill: {},
  pageLayout: {},
  pageLayoutTab: {},
  pageLayoutWidget: {
    configuration: 'configuration',
  },
  commandMenuItem: {},
  navigationMenuItem: {},
  frontComponent: {},
} as const satisfies {
  [P in AllMetadataName]: Partial<{
    // TODO prastoin: improve strict typing to recursively serach for nested SerializedRelation
    [K in ExtractJsonbProperties<MetadataEntity<P>>]: K;
  }>;
};

export type AllJsonbPropertiesWithSerializedPropertiesForMetadataName<
  T extends AllMetadataName,
> =
  keyof (typeof ALL_JSONB_PROPERTIES_WITH_SERIALIZED_RELATION_BY_METADATA_NAME)[T];
