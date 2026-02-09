import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';
import { type ToUniversalForeignKey } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { type UniversalFlatEntityExtraProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

type HasObjectInUnion<T> = T extends unknown
  ? T extends object
    ? true
    : false
  : never;

type MetadataEntityPropertyConfiguration<
  TMetadataName extends AllMetadataName,
> = {
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
      : K extends MetadataManyToOneJoinColumn<TMetadataName> & string
        ? ToUniversalForeignKey<K>
        : undefined;
    toStringify: K extends ExtractJsonbProperties<MetadataEntity<TMetadataName>>
      ? true
      : K extends keyof MetadataEntity<TMetadataName>
        ? HasObjectInUnion<MetadataEntity<TMetadataName>[K]>
        : boolean;
  };
};

export const ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME = {
  fieldMetadata: {
    defaultValue: { toStringify: true, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    isActive: { toStringify: false, universalProperty: undefined },
    isLabelSyncedWithName: { toStringify: false, universalProperty: undefined },
    isUnique: { toStringify: false, universalProperty: undefined },
    label: { toStringify: false, universalProperty: undefined },
    name: { toStringify: false, universalProperty: undefined },
    options: { toStringify: true, universalProperty: undefined },
    standardOverrides: { toStringify: true, universalProperty: undefined },
    settings: { toStringify: true, universalProperty: 'universalSettings' },
  },
  objectMetadata: {
    description: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    isActive: { toStringify: false, universalProperty: undefined },
    isLabelSyncedWithName: { toStringify: false, universalProperty: undefined },
    labelPlural: { toStringify: false, universalProperty: undefined },
    labelSingular: { toStringify: false, universalProperty: undefined },
    namePlural: { toStringify: false, universalProperty: undefined },
    nameSingular: { toStringify: false, universalProperty: undefined },
    labelIdentifierFieldMetadataId: {
      toStringify: false,
      // @ts-expect-error remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
      universalProperty: 'labelIdentifierFieldMetadataUniversalIdentifier',
    },
    standardOverrides: { toStringify: true, universalProperty: undefined },
  },
  view: {
    key: { toStringify: false, universalProperty: undefined },
    deletedAt: { toStringify: false, universalProperty: undefined },
    createdByUserWorkspaceId: {
      toStringify: false,
      universalProperty: undefined,
    },
    name: { toStringify: false, universalProperty: undefined },
    type: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    position: { toStringify: false, universalProperty: undefined },
    isCompact: { toStringify: false, universalProperty: undefined },
    openRecordIn: { toStringify: false, universalProperty: undefined },
    kanbanAggregateOperation: {
      toStringify: false,
      universalProperty: undefined,
    },
    kanbanAggregateOperationFieldMetadataId: {
      toStringify: false,
      universalProperty:
        'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
    },
    anyFieldFilterValue: { toStringify: false, universalProperty: undefined },
    calendarLayout: { toStringify: false, universalProperty: undefined },
    calendarFieldMetadataId: {
      toStringify: false,
      universalProperty: 'calendarFieldMetadataUniversalIdentifier',
    },
    visibility: { toStringify: false, universalProperty: undefined },
    mainGroupByFieldMetadataId: {
      toStringify: false,
      universalProperty: 'mainGroupByFieldMetadataUniversalIdentifier',
    },
    shouldHideEmptyGroups: { toStringify: false, universalProperty: undefined },
  },
  viewField: {
    isVisible: { toStringify: false, universalProperty: undefined },
    size: { toStringify: false, universalProperty: undefined },
    position: { toStringify: false, universalProperty: undefined },
    aggregateOperation: { toStringify: false, universalProperty: undefined },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  viewGroup: {
    isVisible: { toStringify: false, universalProperty: undefined },
    fieldValue: { toStringify: false, universalProperty: undefined },
    position: { toStringify: false, universalProperty: undefined },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  index: {
    indexType: { toStringify: false, universalProperty: undefined },
    indexWhereClause: { toStringify: false, universalProperty: undefined },
    flatIndexFieldMetadatas: {
      toStringify: true,
      universalProperty: undefined,
    },
    isUnique: { toStringify: false, universalProperty: undefined },
    name: { toStringify: false, universalProperty: undefined },
  },
  logicFunction: {
    name: { toStringify: false, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    timeoutSeconds: { toStringify: false, universalProperty: undefined },
    checksum: { toStringify: false, universalProperty: undefined },
    sourceHandlerPath: { toStringify: false, universalProperty: undefined },
    handlerName: { toStringify: false, universalProperty: undefined },
    toolInputSchema: { toStringify: true, universalProperty: undefined },
    isTool: { toStringify: false, universalProperty: undefined },
    deletedAt: { toStringify: false, universalProperty: undefined },
    cronTriggerSettings: { toStringify: true, universalProperty: undefined },
    databaseEventTriggerSettings: {
      toStringify: true,
      universalProperty: undefined,
    },
    httpRouteTriggerSettings: {
      toStringify: true,
      universalProperty: undefined,
    },
  },
  viewFilter: {
    viewId: {
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
    fieldMetadataId: {
      toStringify: false,
      universalProperty: 'fieldMetadataUniversalIdentifier',
    },
    operand: { toStringify: false, universalProperty: undefined },
    value: { toStringify: true, universalProperty: undefined },
    viewFilterGroupId: {
      toStringify: false,
      universalProperty: 'viewFilterGroupUniversalIdentifier',
    },
    positionInViewFilterGroup: {
      toStringify: false,
      universalProperty: undefined,
    },
    subFieldName: { toStringify: false, universalProperty: undefined },
  },
  role: {
    label: { toStringify: false, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    canUpdateAllSettings: { toStringify: false, universalProperty: undefined },
    canAccessAllTools: { toStringify: false, universalProperty: undefined },
    canReadAllObjectRecords: {
      toStringify: false,
      universalProperty: undefined,
    },
    canUpdateAllObjectRecords: {
      toStringify: false,
      universalProperty: undefined,
    },
    canSoftDeleteAllObjectRecords: {
      toStringify: false,
      universalProperty: undefined,
    },
    canDestroyAllObjectRecords: {
      toStringify: false,
      universalProperty: undefined,
    },
    canBeAssignedToUsers: { toStringify: false, universalProperty: undefined },
    canBeAssignedToAgents: { toStringify: false, universalProperty: undefined },
    canBeAssignedToApiKeys: {
      toStringify: false,
      universalProperty: undefined,
    },
  },
  roleTarget: {
    roleId: {
      toStringify: false,
      universalProperty: 'roleUniversalIdentifier',
    },
    userWorkspaceId: { toStringify: false, universalProperty: undefined },
    apiKeyId: { toStringify: false, universalProperty: undefined },
    agentId: { toStringify: false, universalProperty: undefined },
  },
  agent: {
    name: { toStringify: false, universalProperty: undefined },
    label: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    prompt: { toStringify: false, universalProperty: undefined },
    modelId: { toStringify: false, universalProperty: undefined },
    responseFormat: { toStringify: true, universalProperty: undefined },
    modelConfiguration: { toStringify: true, universalProperty: undefined },
    evaluationInputs: { toStringify: true, universalProperty: undefined },
  },
  pageLayout: {
    name: { toStringify: false, universalProperty: undefined },
    type: { toStringify: false, universalProperty: undefined },
    objectMetadataId: {
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  pageLayoutWidget: {
    title: { toStringify: false, universalProperty: undefined },
    type: { toStringify: false, universalProperty: undefined },
    objectMetadataId: {
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    gridPosition: { toStringify: true, universalProperty: undefined },
    position: { toStringify: true, universalProperty: undefined },
    configuration: {
      toStringify: true,
      universalProperty: 'universalConfiguration',
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  pageLayoutTab: {
    title: { toStringify: false, universalProperty: undefined },
    position: { toStringify: false, universalProperty: undefined },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  skill: {
    name: { toStringify: false, universalProperty: undefined },
    label: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    content: { toStringify: false, universalProperty: undefined },
    isActive: { toStringify: false, universalProperty: undefined },
  },
  commandMenuItem: {
    label: { toStringify: false, universalProperty: undefined },
    icon: { toStringify: false, universalProperty: undefined },
    isPinned: { toStringify: false, universalProperty: undefined },
    availabilityType: { toStringify: false, universalProperty: undefined },
    availabilityObjectMetadataId: {
      toStringify: false,
      universalProperty: 'availabilityObjectMetadataUniversalIdentifier',
    },
  },
  navigationMenuItem: {
    position: { toStringify: false, universalProperty: undefined },
    folderId: {
      toStringify: false,
      universalProperty: 'folderUniversalIdentifier',
    },
    name: { toStringify: false, universalProperty: undefined },
  },
  rowLevelPermissionPredicate: {
    fieldMetadataId: {
      toStringify: false,
      universalProperty: 'fieldMetadataUniversalIdentifier',
    },
    operand: { toStringify: false, universalProperty: undefined },
    value: { toStringify: true, universalProperty: undefined },
    rowLevelPermissionPredicateGroupId: {
      toStringify: false,
      universalProperty: 'rowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    positionInRowLevelPermissionPredicateGroup: {
      toStringify: false,
      universalProperty: undefined,
    },
    subFieldName: { toStringify: false, universalProperty: undefined },
    workspaceMemberFieldMetadataId: {
      toStringify: false,
      universalProperty: 'workspaceMemberFieldMetadataUniversalIdentifier',
    },
    workspaceMemberSubFieldName: {
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  rowLevelPermissionPredicateGroup: {
    logicalOperator: { toStringify: false, universalProperty: undefined },
    positionInRowLevelPermissionPredicateGroup: {
      toStringify: false,
      universalProperty: undefined,
    },
    parentRowLevelPermissionPredicateGroupId: {
      toStringify: false,
      universalProperty:
        'parentRowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
  },
  viewFilterGroup: {
    viewId: {
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
    deletedAt: { toStringify: false, universalProperty: undefined },
    parentViewFilterGroupId: {
      toStringify: false,
      universalProperty: 'parentViewFilterGroupUniversalIdentifier',
    },
    logicalOperator: { toStringify: false, universalProperty: undefined },
    positionInViewFilterGroup: {
      toStringify: false,
      universalProperty: undefined,
    },
  },
  frontComponent: {
    name: { toStringify: false, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    builtComponentChecksum: {
      toStringify: false,
      universalProperty: undefined,
    },
    sourceComponentPath: { toStringify: false, universalProperty: undefined },
    builtComponentPath: { toStringify: false, universalProperty: undefined },
    componentName: { toStringify: false, universalProperty: undefined },
  },
  webhook: {
    targetUrl: { toStringify: false, universalProperty: undefined },
    operations: { toStringify: true, universalProperty: undefined },
    description: { toStringify: false, universalProperty: undefined },
    secret: { toStringify: false, universalProperty: undefined },
  },
} as const satisfies {
  [P in AllMetadataName]: MetadataEntityPropertyConfiguration<P>;
};

export type MetadataEntityPropertyName<T extends AllMetadataName> =
  keyof (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T];
