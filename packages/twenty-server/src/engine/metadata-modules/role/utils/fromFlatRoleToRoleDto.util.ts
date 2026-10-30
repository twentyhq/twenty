import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const fromFlatRoleToRoleDto = ({
  canAccessAllAgentChatChannels,
  canAccessAllTools,
  canBeAssignedToAgents,
  canBeAssignedToApiKeys,
  canBeAssignedToUsers,
  canDestroyAllObjectRecords,
  canReadAllObjectRecords,
  canSoftDeleteAllObjectRecords,
  canUpdateAllObjectRecords,
  canUpdateAllSettings,
  id,
  isEditable,
  label,
  description,
  icon,
  universalIdentifier,
  applicationId,
}: FlatRole): RoleDTO => {
  return {
    canAccessAllAgentChatChannels,
    canAccessAllTools,
    canBeAssignedToAgents,
    canBeAssignedToApiKeys,
    canBeAssignedToUsers,
    canDestroyAllObjectRecords,
    canReadAllObjectRecords,
    canSoftDeleteAllObjectRecords,
    canUpdateAllObjectRecords,
    canUpdateAllSettings,
    id,
    isEditable,
    label,
    description: description ?? undefined,
    icon: icon ?? undefined,
    universalIdentifier,
    applicationId,
  };
};
