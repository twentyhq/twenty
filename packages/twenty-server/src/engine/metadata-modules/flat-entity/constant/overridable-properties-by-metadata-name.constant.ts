import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

// Kept out of ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME and free of
// entity types: entities type their overrides column from this, and that
// registry checks itself against every entity property type.
export const OVERRIDABLE_PROPERTIES_BY_METADATA_NAME = {
  fieldMetadata: {
    description: true,
    icon: true,
    label: true,
  },
  objectMetadata: {
    openRecordIn: true,
    color: true,
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
    imageIdentifierFieldMetadataId: true,
  },
  view: {
    name: true,
    type: true,
    icon: true,
    position: true,
    isCompact: true,
    openRecordIn: true,
    kanbanAggregateOperation: true,
    kanbanAggregateOperationFieldMetadataId: true,
    anyFieldFilterValue: true,
    calendarLayout: true,
    calendarFieldMetadataId: true,
    calendarEndFieldMetadataId: true,
    visibility: true,
    mainGroupByFieldMetadataId: true,
    shouldHideEmptyGroups: true,
    kanbanColumnWidth: true,
  },
  viewField: {
    isVisible: true,
    size: true,
    position: true,
    aggregateOperation: true,
    viewFieldGroupId: true,
  },
  viewGroup: {},
  viewFieldGroup: {
    name: true,
    position: true,
    isVisible: true,
  },
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
  pageLayoutTab: {
    title: true,
    position: true,
    icon: true,
  },
  pageLayoutWidget: {
    title: true,
    position: true,
    pageLayoutTabId: true,
    conditionalDisplay: true,
    conditionalAvailabilityExpression: true,
  },
  commandMenuItem: {
    label: true,
    icon: true,
    shortLabel: true,
    position: true,
    isPinned: true,
    availabilityType: true,
    availabilityObjectMetadataId: true,
    engineComponentKey: true,
    hotKeys: true,
    pageLayoutId: true,
  },
  navigationMenuItem: {},
  rolePermissionFlag: {},
  permissionFlag: {},
  objectPermission: {},
  fieldPermission: {},
  frontComponent: {},
  applicationVariable: {},
  connectionProvider: {},
  timelineActivityType: {
    label: true,
    icon: true,
  },
  searchFieldMetadata: {},
} as const satisfies Record<AllMetadataName, Record<string, true>>;

export type MetadataEntityOverridablePropertyName<T extends AllMetadataName> =
  keyof (typeof OVERRIDABLE_PROPERTIES_BY_METADATA_NAME)[T];

type OverridablePropertyMissingFromEntity = {
  [P in AllMetadataName]: `${P}.${Exclude<
    MetadataEntityOverridablePropertyName<P>,
    keyof MetadataEntity<P>
  > &
    string}`;
}[AllMetadataName];

// Checked after the declaration rather than through satisfies, which would make
// the constant's type depend on the entities that depend on it.
// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    [OverridablePropertyMissingFromEntity] extends [never]
      ? true
      : OverridablePropertyMissingFromEntity
  >,
];
