import { type AllMetadataName } from 'twenty-shared/metadata';

import { FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/cron-trigger/constants/flat-cron-trigger-editable-properties.constant';
import { FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/database-event-trigger/constants/flat-database-event-trigger-editable-properties.constant';
import { FLAT_AGENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-agent/constants/flat-agent-editable-properties.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout/constants/flat-page-layout-editable-properties.constant';
import { FLAT_ROLE_TARGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-role-target/constants/flat-role-target-editable-properties.constant';
import { FLAT_ROLE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-role/constants/flat-role-editable-properties.constant';
import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/constants/flat-row-level-permission-predicate-group-editable-properties.constant';
import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/flat-row-level-permission-predicate-editable-properties.constant';
import { FLAT_SKILL_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-skill/constants/flat-skill-editable-properties.constant';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter-group/constants/flat-view-filter-group-editable-properties.constant';
import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { FLAT_VIEW_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-group/constants/flat-view-group-editable-properties.constant';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/route-trigger/constants/flat-route-trigger-editable-properties.constant';
import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';

type OneFlatEntityConfiguration<T extends AllMetadataName> = {
  propertiesToCompare: (keyof MetadataFlatEntity<T>)[];
  propertiesToStringify: (keyof MetadataFlatEntity<T>)[];
};
export const ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY = {
  fieldMetadata: {
    propertiesToCompare: [
      ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.custom,
      'standardOverrides',
    ],
    propertiesToStringify: [
      'options',
      'settings',
      'standardOverrides',
      'defaultValue',
    ],
  },
  objectMetadata: {
    propertiesToCompare: [
      ...FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.custom,
      'standardOverrides',
    ],
    propertiesToStringify: ['standardOverrides'],
  },
  view: {
    propertiesToCompare: [
      'key',
      'deletedAt',
      'createdByUserWorkspaceId',
      ...FLAT_VIEW_EDITABLE_PROPERTIES,
    ],
    propertiesToStringify: [],
  },
  viewField: {
    propertiesToCompare: [...FLAT_VIEW_FIELD_EDITABLE_PROPERTIES, 'deletedAt'],
    propertiesToStringify: [],
  },
  viewGroup: {
    propertiesToCompare: [...FLAT_VIEW_GROUP_EDITABLE_PROPERTIES, 'deletedAt'],
    propertiesToStringify: [],
  },
  index: {
    propertiesToCompare: [
      'indexType',
      'indexWhereClause',
      'flatIndexFieldMetadatas',
      'isUnique',
      'name',
    ],
    propertiesToStringify: ['flatIndexFieldMetadatas'],
  },
  serverlessFunction: {
    propertiesToCompare: [
      ...FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES.filter(
        (property) => property !== 'code',
      ),
      'deletedAt',
    ],
    propertiesToStringify: ['toolInputSchema'],
  },
  cronTrigger: {
    propertiesToCompare: [...FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: ['settings'],
  },
  databaseEventTrigger: {
    propertiesToCompare: [...FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: ['settings'],
  },
  routeTrigger: {
    propertiesToCompare: [...FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: [],
  },
  viewFilter: {
    propertiesToCompare: [
      'viewId',
      'deletedAt',
      ...FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
    ],
    propertiesToStringify: ['value'],
  },
  role: {
    propertiesToCompare: [...FLAT_ROLE_EDITABLE_PROPERTIES],
    propertiesToStringify: [],
  },
  roleTarget: {
    propertiesToCompare: [...FLAT_ROLE_TARGET_EDITABLE_PROPERTIES],
    propertiesToStringify: [],
  },
  agent: {
    propertiesToCompare: [...FLAT_AGENT_EDITABLE_PROPERTIES],
    propertiesToStringify: [
      'responseFormat',
      'modelConfiguration',
      'evaluationInputs',
    ],
  },
  pageLayout: {
    propertiesToCompare: [...FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES, 'deletedAt'],
    propertiesToStringify: [],
  },
  pageLayoutWidget: {
    propertiesToCompare: [
      ...FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: ['gridPosition', 'configuration'],
  },
  pageLayoutTab: {
    propertiesToCompare: [
      ...FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: [],
  },
  skill: {
    propertiesToCompare: [...FLAT_SKILL_EDITABLE_PROPERTIES],
    propertiesToStringify: [],
  },
  rowLevelPermissionPredicate: {
    propertiesToCompare: [
      ...FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: ['value'],
  },
  rowLevelPermissionPredicateGroup: {
    propertiesToCompare: [
      ...FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: [],
  },
  viewFilterGroup: {
    propertiesToCompare: [
      'viewId',
      'deletedAt',
      ...FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES,
    ],
    propertiesToStringify: [],
  },
} as const satisfies {
  [P in AllMetadataName]: OneFlatEntityConfiguration<P>;
};
