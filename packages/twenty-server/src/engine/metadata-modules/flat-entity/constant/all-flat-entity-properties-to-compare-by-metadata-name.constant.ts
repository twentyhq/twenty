import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { UniversalFlatEntityExtraProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

type HasObjectInUnion<T> = T extends unknown
  ? T extends object
    ? true
    : false
  : never;

type FlatEntityPropertyConfiguration<TMetadataName extends AllMetadataName> = {
  [K in keyof Omit<
    MetadataFlatEntity<TMetadataName>,
    | Extract<
        keyof MetadataFlatEntity<TMetadataName>,
        keyof UniversalFlatEntityExtraProperties<
          MetadataEntity<TMetadataName>,
          TMetadataName
        >
      >
    | '__universal'
  >]?: {
    universalProperty: K extends AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TMetadataName> &
      string
      ? `universal${Capitalize<K>}`
      : undefined;
    toStringify: K extends ExtractJsonbProperties<
      MetadataEntity<TMetadataName>
    >
      ? true
      : K extends keyof MetadataEntity<TMetadataName>
        ? HasObjectInUnion<MetadataEntity<TMetadataName>[K]>
        : boolean;
  };
};

type AllFlatEntityPropertiesConfiguration = {
  [P in AllMetadataName]: FlatEntityPropertyConfiguration<P>;
};

// type Result<T extends AllMetadataName> = {
//   propertiesToCompare: MetadataUniversalFlatEntityPropertiesToCompare<T>[];
//   propertiesToStringify: MetadataUniversalFlatEntityPropertiesToStringify<T>[];
// };
// export const getToto = <T extends AllMetadataName>(
//   metadataName: T,
// ): Result<T> => {
//   const occurence =
//     ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME[metadataName];

//   const values = Object.values(occurence);
//   const initialAccumulator: Result<T> = {
//     propertiesToCompare: [],
//     propertiesToStringify: [],
//   };

//   for (const value of values) {
//     if (Object.keys(values))
//   }

//   return {
//     propertiesToCompare: [],
//     propertiesToStringify: [],
//   };
// };

export const ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME = {
  fieldMetadata: {
    defaultValue: { toStringify: true },
    description: {},
    icon: {},
    isActive: {},
    isLabelSyncedWithName: {},
    isUnique: {},
    label: {},
    name: {},
    options: { toStringify: true },
    standardOverrides: { toStringify: true },
    settings: { toStringify: true, universalProperty: 'universalSettings' },
  },
  objectMetadata: {
    description: {},
    icon: {},
    isActive: {},
    isLabelSyncedWithName: {},
    labelPlural: {},
    labelSingular: {},
    namePlural: {},
    nameSingular: {},
    labelIdentifierFieldMetadataUniversalIdentifier: {},
    standardOverrides: { toStringify: true },
  },
  view: {
    key: {},
    deletedAt: {},
    createdByUserWorkspaceId: {},
    name: {},
    type: {},
    icon: {},
    position: {},
    isCompact: {},
    openRecordIn: {},
    kanbanAggregateOperation: {},
    kanbanAggregateOperationFieldMetadataId: {},
    anyFieldFilterValue: {},
    calendarLayout: {},
    calendarFieldMetadataId: {},
    visibility: {},
    mainGroupByFieldMetadataId: {},
    shouldHideEmptyGroups: {},
  },
  viewField: {
    isVisible: {},
    size: {},
    position: {},
    aggregateOperation: {},
    deletedAt: {},
  },
  viewGroup: {
    isVisible: {},
    fieldValue: {},
    position: {},
    deletedAt: {},
  },
  index: {
    indexType: {},
    indexWhereClause: {},
    flatIndexFieldMetadatas: { toStringify: true },
    isUnique: {},
    name: {},
  },
  logicFunction: {
    name: {},
    description: {},
    timeoutSeconds: {},
    checksum: {},
    sourceHandlerPath: {},
    handlerName: {},
    toolInputSchema: { toStringify: true },
    isTool: {},
    deletedAt: {},
  },
  viewFilter: {
    viewId: {},
    deletedAt: {},
    fieldMetadataId: {},
    operand: {},
    value: { toStringify: true },
    viewFilterGroupId: {},
    positionInViewFilterGroup: {},
    subFieldName: {},
  },
  role: {
    label: {},
    description: {},
    icon: {},
    canUpdateAllSettings: {},
    canAccessAllTools: {},
    canReadAllObjectRecords: {},
    canUpdateAllObjectRecords: {},
    canSoftDeleteAllObjectRecords: {},
    canDestroyAllObjectRecords: {},
    canBeAssignedToUsers: {},
    canBeAssignedToAgents: {},
    canBeAssignedToApiKeys: {},
  },
  roleTarget: {
    roleId: {},
    userWorkspaceId: {},
    apiKeyId: {},
    agentId: {},
  },
  agent: {
    name: {},
    label: {},
    icon: {},
    description: {},
    prompt: {},
    modelId: {},
    responseFormat: { toStringify: true },
    modelConfiguration: { toStringify: true },
    evaluationInputs: { toStringify: true },
  },
  pageLayout: {
    name: {},
    type: {},
    objectMetadataId: {},
    deletedAt: {},
  },
  pageLayoutWidget: {
    title: {},
    type: {},
    objectMetadataId: {},
    gridPosition: { toStringify: true },
    position: {},
    configuration: {
      toStringify: true,
      universalProperty: 'universalConfiguration',
    },
    deletedAt: {},
  },
  pageLayoutTab: {
    title: {},
    position: {},
    deletedAt: {},
  },
  skill: {
    name: {},
    label: {},
    icon: {},
    description: {},
    content: {},
    isActive: {},
  },
  commandMenuItem: {
    label: {},
    icon: {},
    isPinned: {},
    availabilityType: {},
    availabilityObjectMetadataId: {},
  },
  navigationMenuItem: {
    position: {},
    folderId: {},
    name: {},
  },
  rowLevelPermissionPredicate: {
    fieldMetadataId: {},
    operand: {},
    value: { toStringify: true },
    rowLevelPermissionPredicateGroupId: {},
    positionInRowLevelPermissionPredicateGroup: {},
    subFieldName: {},
    workspaceMemberFieldMetadataId: {},
    workspaceMemberSubFieldName: {},
    deletedAt: {},
  },
  rowLevelPermissionPredicateGroup: {
    logicalOperator: {},
    positionInRowLevelPermissionPredicateGroup: {},
    parentRowLevelPermissionPredicateGroupId: {},
    deletedAt: {},
  },
  viewFilterGroup: {
    viewId: {},
    deletedAt: {},
    parentViewFilterGroupId: {},
    logicalOperator: {},
    positionInViewFilterGroup: {},
  },
  frontComponent: {
    name: {},
  },
  webhook: {
    targetUrl: {},
    operations: { toStringify: true },
    description: {},
    secret: {},
  },
} as const satisfies AllFlatEntityPropertiesConfiguration;
