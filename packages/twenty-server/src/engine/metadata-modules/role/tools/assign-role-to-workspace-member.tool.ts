import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { findFlatRoleForToolOrThrow } from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';

const assignRoleToWorkspaceMemberSchema = z.object({
  workspaceMemberId: z
    .string()
    .uuid()
    .describe('Id of the workspace member to assign the role to'),
  roleId: z.string().uuid().describe('Id of the role to assign'),
});

type AssignRoleToWorkspaceMemberParams = z.infer<
  typeof assignRoleToWorkspaceMemberSchema
>;

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
        throw new Error(
          'You cannot change your own role. Ask another administrator to update it.',
        );
      }

      const { flatRoleMaps } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatRoleMaps'],
          },
        );

      const flatRole = findFlatRoleForToolOrThrow({
        roleId: parameters.roleId,
        flatRoleMaps,
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
        });

      if (userWorkspace.id === context.callerUserWorkspaceId) {
        throw new Error(
          'You cannot change your own role. Ask another administrator to update it.',
        );
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
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to assign role: ${message}`,
        error: message,
      };
    }
  },
});
