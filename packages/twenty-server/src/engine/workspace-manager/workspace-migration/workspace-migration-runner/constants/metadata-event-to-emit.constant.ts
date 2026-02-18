import { type AllMetadataName } from 'twenty-shared/metadata';

export const METADATA_EVENTS_TO_EMIT = {
  frontComponent: true,
  objectMetadata: true,
  fieldMetadata: true,
  view: true,
  viewField: true,
  viewFieldGroup: true,
  viewGroup: true,
  viewFilter: true,
  viewFilterGroup: true,
  role: true,
  roleTarget: true,
  agent: true,
  skill: true,
  pageLayout: true,
  pageLayoutWidget: true,
  pageLayoutTab: true,
  commandMenuItem: true,
  navigationMenuItem: true,
  rowLevelPermissionPredicate: true,
  rowLevelPermissionPredicateGroup: true,
  index: true,
  logicFunction: true,

  webhook: false,
} as const satisfies { [P in AllMetadataName]: boolean };
