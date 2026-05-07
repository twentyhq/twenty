import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { type PermissionFlagDefinitionDTO } from 'src/engine/metadata-modules/permission-flag-definition/dtos/permission-flag-definition.dto';

export const fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto = (
  flatDefinition: FlatPermissionFlagDefinition,
): PermissionFlagDefinitionDTO => ({
  id: flatDefinition.id,
  universalIdentifier: flatDefinition.universalIdentifier,
  key: flatDefinition.key,
  label: flatDefinition.label,
  description: flatDefinition.description,
  iconKey: flatDefinition.iconKey,
  permissionType: flatDefinition.permissionType,
  isRelevantForAgents: flatDefinition.isRelevantForAgents,
  isRelevantForUsers: flatDefinition.isRelevantForUsers,
  isRelevantForApiKeys: flatDefinition.isRelevantForApiKeys,
  isCustom: flatDefinition.isCustom,
  workspaceId: flatDefinition.workspaceId,
  applicationId: flatDefinition.applicationId,
  createdAt: new Date(flatDefinition.createdAt),
  updatedAt: new Date(flatDefinition.updatedAt),
});
