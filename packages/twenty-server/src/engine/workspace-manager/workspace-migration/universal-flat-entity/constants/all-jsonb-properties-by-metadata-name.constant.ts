import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';

export const ALL_JSONB_PROPERTIES_BY_METADATA_NAME = {
  fieldMetadata: {
    defaultValue: 'defaultValue',
    standardOverrides: 'standardOverrides',
    options: 'options',
    settings: 'settings',
  },
  objectMetadata: {
    standardOverrides: 'standardOverrides',
    duplicateCriteria: 'duplicateCriteria',
  },
  view: {},
  viewField: {},
  viewGroup: {},
  viewFilter: { value: 'value' },
  viewFilterGroup: {},
  index: {},
  role: {},
  roleTarget: {},
  rowLevelPermissionPredicate: { value: 'value' },
  rowLevelPermissionPredicateGroup: {},
  logicFunction: {
    cronTriggerSettings: 'cronTriggerSettings',
    databaseEventTriggerSettings: 'databaseEventTriggerSettings',
    httpRouteTriggerSettings: 'httpRouteTriggerSettings',
    toolInputSchema: 'toolInputSchema',
  },
  webhook: {},
  agent: {
    responseFormat: 'responseFormat',
    modelConfiguration: 'modelConfiguration',
  },
  skill: {},
  pageLayout: {},
  pageLayoutTab: {},
  pageLayoutWidget: {
    gridPosition: 'gridPosition',
    configuration: 'configuration',
  },
  commandMenuItem: {},
  navigationMenuItem: {},
  frontComponent: {},
} as const satisfies {
  [P in AllMetadataName]: {
    [K in ExtractJsonbProperties<MetadataEntity<P>>]: K;
  };
};

export type AllJsonbPropertiesForMetadataName<T extends AllMetadataName> =
  keyof (typeof ALL_JSONB_PROPERTIES_BY_METADATA_NAME)[T];
