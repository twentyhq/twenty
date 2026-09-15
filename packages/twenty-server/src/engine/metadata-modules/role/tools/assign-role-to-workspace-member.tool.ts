import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const assignRoleToWorkspaceMemberSchema = z.object({
  workspaceMemberId: z
    .uuid()
    .describe('Id of the workspace member to assign the role to'),
  roleId: z.uuid().describe('Id of the role to assign'),
});

type AssignRoleToWorkspaceMemberParams = z.infer<
  typeof assignRoleToWorkspaceMemberSchema
>;

export const createAssignRoleToWorkspaceMemberTool = (
  deps: Pick<RoleToolDependencies, 'userRoleService'>,
  context: RoleToolContext,
) => ({
  name: 'assign_role_to_workspace_member' as const,
  description: `Assign a role to a workspace member, replacing their current role.

You cannot change your own role, assign a role that does not allow user assignment (canBeAssignedToUsers=false), or remove the admin role from the last administrator.`,
  inputSchema: assignRoleToWorkspaceMemberSchema,
  execute: async (parameters: AssignRoleToWorkspaceMemberParams) => {
    try {
      const { workspaceMember } =
        await deps.userRoleService.assignRoleToWorkspaceMember({
          workspaceId: context.workspaceId,
          workspaceMemberId: parameters.workspaceMemberId,
          roleId: parameters.roleId,
          actingUserWorkspaceId: context.callerUserWorkspaceId,
        });

      return {
        success: true,
        message:
          `Role assigned to workspace member ${workspaceMember.name?.firstName ?? ''} ${workspaceMember.name?.lastName ?? ''}`.trim(),
        result: {
          workspaceMemberId: parameters.workspaceMemberId,
          roleId: parameters.roleId,
        },
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to assign role: ${message}`,
        error: message,
      };
    }
  },
});
