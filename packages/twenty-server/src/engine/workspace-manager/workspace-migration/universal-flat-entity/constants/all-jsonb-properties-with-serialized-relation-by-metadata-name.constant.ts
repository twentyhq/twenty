import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';

// Not strictly typed: every jsonb property that may contain a serialized
// relation has to be referenced here by hand.
export const ALL_JSONB_PROPERTIES_WITH_SERIALIZED_RELATION_BY_METADATA_NAME = {
  fieldMetadata: {
    settings: 'settings',
  },
  objectMetadata: {},
  view: {
    overrides: 'overrides',
  },
  viewField: {
    overrides: 'overrides',
  },
  viewGroup: {},
  viewFieldGroup: {},
  viewFilter: {},
  viewFilterGroup: {},
  viewSort: {},
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
    overrides: 'overrides',
  },
  commandMenuItem: {
    overrides: 'overrides',
  },
  navigationMenuItem: {},
  rolePermissionFlag: {},
  permissionFlag: {},
  objectPermission: {},
  fieldPermission: {},
  frontComponent: {},
  applicationVariable: {},
  connectionProvider: {},
  timelineActivityType: {},
  validationRule: {},
  searchFieldMetadata: {},
  settingsMenuItem: {},
  workflow: {},
  workflowVersion: {},
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
