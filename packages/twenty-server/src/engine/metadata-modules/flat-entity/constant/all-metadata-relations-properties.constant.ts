import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

export const ALL_METADATA_RELATION_PROPERTIES = {
  agent: {
    workspace: true,
    application: true,
  },
  skill: {
    workspace: true,
    application: true,
  },
  fieldMetadata: {
    relationTargetFieldMetadata: true,
    relationTargetObjectMetadata: true,
    fieldPermissions: true,
    indexFieldMetadatas: true,
    object: true,
    viewFields: true,
    viewFilters: true,
    kanbanAggregateOperationViews: true,
    calendarViews: true,
    mainGroupByFieldMetadataViews: true,
    workspace: true,
    application: true,
  },
  objectMetadata: {
    fields: true,
    indexMetadatas: true,
    targetRelationFields: true,
    dataSource: true,
    objectPermissions: true,
    fieldPermissions: true,
    views: true,
    workspace: true,
    application: true,
  },
  view: {
    objectMetadata: true,
    viewFields: true,
    viewFilters: true,
    viewFilterGroups: true,
    viewGroups: true,
    viewSorts: true,
    workspace: true,
    createdBy: true,
    application: true,
    calendarFieldMetadata: true,
    kanbanAggregateOperationFieldMetadata: true,
    mainGroupByFieldMetadata: true,
  },
  viewField: {
    fieldMetadata: true,
    view: true,
    workspace: true,
    application: true,
  },
  viewFilter: {
    fieldMetadata: true,
    view: true,
    viewFilterGroup: true,
    workspace: true,
    application: true,
  },
  viewGroup: {
    view: true,
    workspace: true,
    application: true,
  },
  index: {
    objectMetadata: true,
    indexFieldMetadatas: true,
    workspace: true,
    application: true,
  },
  serverlessFunction: {
    cronTriggers: true,
    databaseEventTriggers: true,
    routeTriggers: true,
    serverlessFunctionLayer: true,
    workspace: true,
    application: true,
  },
  cronTrigger: {
    serverlessFunction: true,
    workspace: true,
    application: true,
  },
  databaseEventTrigger: {
    serverlessFunction: true,
    workspace: true,
    application: true,
  },
  routeTrigger: {
    serverlessFunction: true,
    workspace: true,
    application: true,
  },
  role: {
    roleTargets: true,
    objectPermissions: true,
    permissionFlags: true,
    fieldPermissions: true,
    workspace: true,
    application: true,
  },
  roleTarget: {
    role: true,
    apiKey: true,
    workspace: true,
    application: true,
  },
  pageLayout: {
    workspace: true,
    objectMetadata: true,
    tabs: true,
    application: true,
  },
  pageLayoutTab: {
    workspace: true,
    pageLayout: true,
    widgets: true,
    application: true,
  },
  pageLayoutWidget: {
    workspace: true,
    pageLayoutTab: true,
    objectMetadata: true,
    application: true,
  },
  rowLevelPermissionPredicate: {
    workspace: true,
    role: true,
    fieldMetadata: true,
    workspaceMemberFieldMetadata: true,
    objectMetadata: true,
    rowLevelPermissionPredicateGroup: true,
    application: true,
  },
  rowLevelPermissionPredicateGroup: {
    workspace: true,
    role: true,
    parentRowLevelPermissionPredicateGroup: true,
    childRowLevelPermissionPredicateGroups: true,
    rowLevelPermissionPredicates: true,
    application: true,
  },
} as const satisfies {
  [TName in AllMetadataName]: {
    [P in ExtractEntityRelatedEntityProperties<MetadataEntity<TName>>]: true;
  };
};
