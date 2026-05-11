import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';

export const fromFlatPermissionFlagToPermissionFlagDto = (
  flatDefinition: FlatPermissionFlag,
): PermissionFlagDTO => ({
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
