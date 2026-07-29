import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { getFlatRoleForToolOrThrow } from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';
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

const SELF_ROLE_CHANGE_ERROR =
  'You cannot change your own role. Ask another administrator to update it.';

export const createAssignRoleToWorkspaceMemberTool = (
  deps: Pick<
    RoleToolDependencies,
    'userRoleService' | 'userWorkspaceService' | 'flatEntityMapsCacheService'
  >,
  context: RoleToolContext,
) => ({
  name: 'assign_role_to_workspace_member' as const,
  description: `Assign a role to a workspace member, replacing their current role.

You cannot change your own role, assign a role that does not allow user assignment (canBeAssignedToUsers=false), or remove the admin role from the last administrator.`,
  inputSchema: assignRoleToWorkspaceMemberSchema,
  execute: async (parameters: AssignRoleToWorkspaceMemberParams) => {
    try {
      if (parameters.workspaceMemberId === context.callerWorkspaceMemberId) {
        throw new Error(SELF_ROLE_CHANGE_ERROR);
      }

      const flatRole = await getFlatRoleForToolOrThrow({
        roleId: parameters.roleId,
        workspaceId: context.workspaceId,
        flatEntityMapsCacheService: deps.flatEntityMapsCacheService,
      });

      if (!flatRole.canBeAssignedToUsers) {
        throw new Error(
          `Role "${flatRole.label}" cannot be assigned to users (canBeAssignedToUsers is false).`,
        );
      }

      const workspaceMember =
        await deps.userWorkspaceService.getWorkspaceMemberOrThrow({
          workspaceMemberId: parameters.workspaceMemberId,
          workspaceId: context.workspaceId,
        });

      const userWorkspace =
        await deps.userWorkspaceService.getUserWorkspaceForUserOrThrow({
          userId: workspaceMember.userId,
          workspaceId: context.workspaceId,
          relations: [],
        });

      if (userWorkspace.id === context.callerUserWorkspaceId) {
        throw new Error(SELF_ROLE_CHANGE_ERROR);
      }

      await deps.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId: context.workspaceId,
        userWorkspaceIds: [userWorkspace.id],
        roleId: parameters.roleId,
      });

      return {
        success: true,
        message:
          `Role "${flatRole.label}" assigned to workspace member ${workspaceMember.name?.firstName ?? ''} ${workspaceMember.name?.lastName ?? ''}`.trim(),
        result: {
          workspaceMemberId: parameters.workspaceMemberId,
          roleId: parameters.roleId,
          roleLabel: flatRole.label,
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
