import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridablePropertyConfiguration = {
  isOverridable?: boolean;
  universalProperty?: string;
};

const getOverridableUniversalProperties = (
  metadataName: AllMetadataName,
): readonly string[] => {
  const propertiesConfiguration: Record<
    string,
    OverridablePropertyConfiguration
  > = ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];

  return Object.entries(propertiesConfiguration).flatMap(
    ([property, { isOverridable, universalProperty }]) =>
      isOverridable ? [universalProperty ?? property] : [],
  );
};

export const ALL_OVERRIDABLE_UNIVERSAL_PROPERTIES_BY_METADATA_NAME: Record<
  AllMetadataName,
  readonly string[]
> = {
  fieldMetadata: getOverridableUniversalProperties(
    ALL_METADATA_NAME.fieldMetadata,
  ),
  fieldMetadataOption: getOverridableUniversalProperties(
    ALL_METADATA_NAME.fieldMetadataOption,
  ),
  objectMetadata: getOverridableUniversalProperties(
    ALL_METADATA_NAME.objectMetadata,
  ),
  view: getOverridableUniversalProperties(ALL_METADATA_NAME.view),
  viewField: getOverridableUniversalProperties(ALL_METADATA_NAME.viewField),
  viewFieldGroup: getOverridableUniversalProperties(
    ALL_METADATA_NAME.viewFieldGroup,
  ),
  viewGroup: getOverridableUniversalProperties(ALL_METADATA_NAME.viewGroup),
  viewSort: getOverridableUniversalProperties(ALL_METADATA_NAME.viewSort),
  rowLevelPermissionPredicate: getOverridableUniversalProperties(
    ALL_METADATA_NAME.rowLevelPermissionPredicate,
  ),
  rowLevelPermissionPredicateGroup: getOverridableUniversalProperties(
    ALL_METADATA_NAME.rowLevelPermissionPredicateGroup,
  ),
  rowLevelPermissionRule: getOverridableUniversalProperties(
    ALL_METADATA_NAME.rowLevelPermissionRule,
  ),
  viewFilterGroup: getOverridableUniversalProperties(
    ALL_METADATA_NAME.viewFilterGroup,
  ),
  index: getOverridableUniversalProperties(ALL_METADATA_NAME.index),
  logicFunction: getOverridableUniversalProperties(
    ALL_METADATA_NAME.logicFunction,
  ),
  viewFilter: getOverridableUniversalProperties(ALL_METADATA_NAME.viewFilter),
  role: getOverridableUniversalProperties(ALL_METADATA_NAME.role),
  roleTarget: getOverridableUniversalProperties(ALL_METADATA_NAME.roleTarget),
  agent: getOverridableUniversalProperties(ALL_METADATA_NAME.agent),
  skill: getOverridableUniversalProperties(ALL_METADATA_NAME.skill),
  pageLayout: getOverridableUniversalProperties(ALL_METADATA_NAME.pageLayout),
  pageLayoutWidget: getOverridableUniversalProperties(
    ALL_METADATA_NAME.pageLayoutWidget,
  ),
  pageLayoutTab: getOverridableUniversalProperties(
    ALL_METADATA_NAME.pageLayoutTab,
  ),
  commandMenuItem: getOverridableUniversalProperties(
    ALL_METADATA_NAME.commandMenuItem,
  ),
  navigationMenuItem: getOverridableUniversalProperties(
    ALL_METADATA_NAME.navigationMenuItem,
  ),
  rolePermissionFlag: getOverridableUniversalProperties(
    ALL_METADATA_NAME.rolePermissionFlag,
  ),
  permissionFlag: getOverridableUniversalProperties(
    ALL_METADATA_NAME.permissionFlag,
  ),
  objectPermission: getOverridableUniversalProperties(
    ALL_METADATA_NAME.objectPermission,
  ),
  fieldPermission: getOverridableUniversalProperties(
    ALL_METADATA_NAME.fieldPermission,
  ),
  frontComponent: getOverridableUniversalProperties(
    ALL_METADATA_NAME.frontComponent,
  ),
  webhook: getOverridableUniversalProperties(ALL_METADATA_NAME.webhook),
  applicationVariable: getOverridableUniversalProperties(
    ALL_METADATA_NAME.applicationVariable,
  ),
  connectionProvider: getOverridableUniversalProperties(
    ALL_METADATA_NAME.connectionProvider,
  ),
  messagingProvider: getOverridableUniversalProperties(
    ALL_METADATA_NAME.messagingProvider,
  ),
  mcpServer: getOverridableUniversalProperties(ALL_METADATA_NAME.mcpServer),
  eventMetadata: getOverridableUniversalProperties(
    ALL_METADATA_NAME.eventMetadata,
  ),
  searchFieldMetadata: getOverridableUniversalProperties(
    ALL_METADATA_NAME.searchFieldMetadata,
  ),
  timelineActivityType: getOverridableUniversalProperties(
    ALL_METADATA_NAME.timelineActivityType,
  ),
  settingsMenuItem: getOverridableUniversalProperties(
    ALL_METADATA_NAME.settingsMenuItem,
  ),
  relatedRecordPath: getOverridableUniversalProperties(
    ALL_METADATA_NAME.relatedRecordPath,
  ),
  validationRule: getOverridableUniversalProperties(
    ALL_METADATA_NAME.validationRule,
  ),
  workflow: getOverridableUniversalProperties(ALL_METADATA_NAME.workflow),
  workflowVersion: getOverridableUniversalProperties(
    ALL_METADATA_NAME.workflowVersion,
  ),
  agentChatChannel: getOverridableUniversalProperties(
    ALL_METADATA_NAME.agentChatChannel,
  ),
  agentChatChannelRole: getOverridableUniversalProperties(
    ALL_METADATA_NAME.agentChatChannelRole,
  ),
};
