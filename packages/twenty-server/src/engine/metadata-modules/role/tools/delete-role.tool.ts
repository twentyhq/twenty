import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import {
  assertRoleDeletionDoesNotLockOutCaller,
  assertRoleIsEditable,
  getFlatRoleForToolOrThrow,
} from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const deleteRoleSchema = z.object({
  roleId: z.uuid().describe('Id of the role to delete'),
});

type DeleteRoleParams = z.infer<typeof deleteRoleSchema>;

export const createDeleteRoleTool = (
  deps: Pick<
    RoleToolDependencies,
    'roleService' | 'flatEntityMapsCacheService'
  >,
  context: RoleToolContext,
) => ({
  name: 'delete_role' as const,
  description: `Delete a role. Members, agents and API keys assigned to it are reassigned to the workspace default role.

System-managed roles (isEditable=false, like Admin), the workspace default role, and the role you are currently acting under cannot be deleted.`,
  inputSchema: deleteRoleSchema,
  execute: async (parameters: DeleteRoleParams) => {
    try {
      const flatRole = await getFlatRoleForToolOrThrow({
        roleId: parameters.roleId,
        workspaceId: context.workspaceId,
        flatEntityMapsCacheService: deps.flatEntityMapsCacheService,
      });

      assertRoleIsEditable(flatRole);
      assertRoleDeletionDoesNotLockOutCaller({
        flatRole,
        callerRoleIds: context.callerRoleIds,
      });

      const deletedRole = await deps.roleService.deleteRole({
        roleId: parameters.roleId,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Role "${deletedRole.label}" deleted`,
        result: { id: deletedRole.id, label: deletedRole.label },
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to delete role: ${message}`,
        error: message,
      };
    }
  },
});
