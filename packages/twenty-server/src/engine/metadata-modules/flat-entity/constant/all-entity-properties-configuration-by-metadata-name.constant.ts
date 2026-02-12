import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';
import { type ToUniversalForeignKey } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';

type HasObjectInUnion<T> = T extends unknown
  ? T extends object
    ? true
    : false
  : never;

type MetadataEntityPropertyConfiguration<
  TMetadataName extends AllMetadataName,
> = {
  [K in keyof Omit<
    ScalarFlatEntity<MetadataEntity<TMetadataName>>,
    'id' | 'workspaceId' | 'applicationId' | 'universalIdentifier'
  >]: {
    universalProperty: K extends AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TMetadataName> &
      string
      ? `universal${Capitalize<K>}`
      : K extends MetadataManyToOneJoinColumn<TMetadataName> & string
        ? ToUniversalForeignKey<K>
        : undefined;
    toStringify: K extends ExtractJsonbProperties<MetadataEntity<TMetadataName>>
      ? true
      : K extends keyof MetadataEntity<TMetadataName>
        ? NonNullable<MetadataEntity<TMetadataName>[K]> extends Date
          ? false
          : HasObjectInUnion<MetadataEntity<TMetadataName>[K]>
        : boolean;
    toCompare: boolean;
  };
};

export const ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME = {
  fieldMetadata: {
    defaultValue: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    isActive: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isLabelSyncedWithName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isUnique: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    label: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    options: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    standardOverrides: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    settings: {
      toCompare: true,
      toStringify: true,
      universalProperty: 'universalSettings',
    },
    objectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    type: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isSystem: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isUIReadOnly: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isNullable: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    relationTargetFieldMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'relationTargetFieldMetadataUniversalIdentifier',
    },
    relationTargetObjectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'relationTargetObjectMetadataUniversalIdentifier',
    },
    morphId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  objectMetadata: {
    dataSourceId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    isActive: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isLabelSyncedWithName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    labelPlural: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    labelSingular: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    namePlural: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    nameSingular: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    labelIdentifierFieldMetadataId: {
      toCompare: true,
      toStringify: false,
      // @ts-expect-error remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
      universalProperty: 'labelIdentifierFieldMetadataUniversalIdentifier',
    },
    standardOverrides: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isRemote: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isSystem: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isUIReadOnly: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isAuditLogged: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    isSearchable: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    duplicateCriteria: {
      toCompare: false,
      toStringify: true,
      universalProperty: undefined,
    },
    shortcut: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    imageIdentifierFieldMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    targetTableName: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  view: {
    key: { toCompare: true, toStringify: false, universalProperty: undefined },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdByUserWorkspaceId: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    type: { toCompare: true, toStringify: false, universalProperty: undefined },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    position: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isCompact: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    openRecordIn: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    kanbanAggregateOperation: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    kanbanAggregateOperationFieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty:
        'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
    },
    anyFieldFilterValue: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    calendarLayout: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    calendarFieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'calendarFieldMetadataUniversalIdentifier',
    },
    visibility: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    mainGroupByFieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'mainGroupByFieldMetadataUniversalIdentifier',
    },
    shouldHideEmptyGroups: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    objectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  viewFieldGroup: {
    name: { toStringify: false, universalProperty: undefined, toCompare: true },
    position: {
      toStringify: false,
      universalProperty: undefined,
      toCompare: true,
    },
    isVisible: {
      toStringify: false,
      universalProperty: undefined,
      toCompare: true,
    },
    deletedAt: {
      toStringify: false,
      universalProperty: undefined,
      toCompare: true,
    },
    createdAt: {
      toCompare: false,
      universalProperty: undefined,
      toStringify: false,
    },
    updatedAt: {
      toCompare: false,
      universalProperty: undefined,
      toStringify: false,
    },
    viewId: {
      toCompare: false,
      universalProperty: 'viewUniversalIdentifier',
      toStringify: false,
    },
  },
  viewField: {
    isVisible: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    size: { toCompare: true, toStringify: false, universalProperty: undefined },
    position: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    aggregateOperation: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    viewFieldGroupId: {
      toStringify: false,
      universalProperty: 'viewFieldGroupUniversalIdentifier',
      toCompare: true,
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    fieldMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'fieldMetadataUniversalIdentifier',
    },
    viewId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
  },
  viewGroup: {
    isVisible: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    fieldValue: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    position: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    viewId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
  },
  index: {
    indexType: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    indexWhereClause: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isUnique: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    objectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  logicFunction: {
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    timeoutSeconds: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    checksum: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    sourceHandlerPath: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    handlerName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    toolInputSchema: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    isTool: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isBuildUpToDate: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    cronTriggerSettings: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    databaseEventTriggerSettings: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    httpRouteTriggerSettings: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    builtHandlerPath: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    runtime: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  viewFilter: {
    viewId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    fieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'fieldMetadataUniversalIdentifier',
    },
    operand: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    value: { toCompare: true, toStringify: true, universalProperty: undefined },
    viewFilterGroupId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'viewFilterGroupUniversalIdentifier',
    },
    positionInViewFilterGroup: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    subFieldName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  role: {
    label: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    canUpdateAllSettings: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canAccessAllTools: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canReadAllObjectRecords: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canUpdateAllObjectRecords: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canSoftDeleteAllObjectRecords: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canDestroyAllObjectRecords: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canBeAssignedToUsers: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canBeAssignedToAgents: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    canBeAssignedToApiKeys: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isEditable: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  roleTarget: {
    roleId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'roleUniversalIdentifier',
    },
    userWorkspaceId: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    apiKeyId: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    agentId: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  agent: {
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    label: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    prompt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    modelId: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    responseFormat: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    modelConfiguration: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    evaluationInputs: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  pageLayout: {
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    type: { toCompare: true, toStringify: false, universalProperty: undefined },
    objectMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    defaultTabToFocusOnMobileAndSidePanelId: {
      toCompare: true,
      toStringify: false,
      universalProperty:
        'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier',
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  pageLayoutWidget: {
    title: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    type: { toCompare: true, toStringify: false, universalProperty: undefined },
    objectMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    gridPosition: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    position: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    configuration: {
      toCompare: true,
      toStringify: true,
      universalProperty: 'universalConfiguration',
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    pageLayoutTabId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'pageLayoutTabUniversalIdentifier',
    },
    conditionalDisplay: {
      toCompare: false,
      toStringify: true,
      universalProperty: undefined,
    },
  },
  pageLayoutTab: {
    title: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    position: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    pageLayoutId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'pageLayoutUniversalIdentifier',
    },
    layoutMode: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  skill: {
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    label: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    content: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isActive: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    isCustom: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  commandMenuItem: {
    label: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    icon: { toCompare: true, toStringify: false, universalProperty: undefined },
    isPinned: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    availabilityType: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    availabilityObjectMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'availabilityObjectMetadataUniversalIdentifier',
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    frontComponentId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'frontComponentUniversalIdentifier',
    },
    workflowVersionId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  navigationMenuItem: {
    position: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    folderId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'folderUniversalIdentifier',
    },
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    link: { toCompare: true, toStringify: false, universalProperty: undefined },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    viewId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
    userWorkspaceId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    targetRecordId: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    targetObjectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'targetObjectMetadataUniversalIdentifier',
    },
  },
  rowLevelPermissionPredicate: {
    fieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'fieldMetadataUniversalIdentifier',
    },
    operand: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    value: { toCompare: true, toStringify: true, universalProperty: undefined },
    rowLevelPermissionPredicateGroupId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'rowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    positionInRowLevelPermissionPredicateGroup: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    subFieldName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    workspaceMemberFieldMetadataId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'workspaceMemberFieldMetadataUniversalIdentifier',
    },
    workspaceMemberSubFieldName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    objectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    roleId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'roleUniversalIdentifier',
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  rowLevelPermissionPredicateGroup: {
    logicalOperator: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    positionInRowLevelPermissionPredicateGroup: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    parentRowLevelPermissionPredicateGroupId: {
      toCompare: true,
      toStringify: false,
      universalProperty:
        'parentRowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    objectMetadataId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'objectMetadataUniversalIdentifier',
    },
    roleId: {
      toCompare: false,
      toStringify: false,
      universalProperty: 'roleUniversalIdentifier',
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  viewFilterGroup: {
    viewId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'viewUniversalIdentifier',
    },
    deletedAt: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    parentViewFilterGroupId: {
      toCompare: true,
      toStringify: false,
      universalProperty: 'parentViewFilterGroupUniversalIdentifier',
    },
    logicalOperator: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    positionInViewFilterGroup: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  frontComponent: {
    name: { toCompare: true, toStringify: false, universalProperty: undefined },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    builtComponentChecksum: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    sourceComponentPath: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    builtComponentPath: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    componentName: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
  webhook: {
    targetUrl: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    operations: {
      toCompare: true,
      toStringify: true,
      universalProperty: undefined,
    },
    description: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    secret: {
      toCompare: true,
      toStringify: false,
      universalProperty: undefined,
    },
    createdAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    updatedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
    deletedAt: {
      toCompare: false,
      toStringify: false,
      universalProperty: undefined,
    },
  },
} as const satisfies {
  [P in AllMetadataName]: MetadataEntityPropertyConfiguration<P>;
};

export type MetadataEntityPropertyName<T extends AllMetadataName> =
  keyof (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T];

type FilterComparableKeys<TConfig> = {
  [P in keyof TConfig]: TConfig[P] extends { toCompare: true } ? P : never;
}[keyof TConfig];

export type MetadataEntityComparablePropertyName<T extends AllMetadataName> =
  FilterComparableKeys<
    (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
  >;
