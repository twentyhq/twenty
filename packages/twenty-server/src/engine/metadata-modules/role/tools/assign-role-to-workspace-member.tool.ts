import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

const assignRoleToWorkspaceMemberInputSchema = z.object({
  workspaceMemberId: z
    .uuid()
    .describe('Id of the workspace member to assign the role to'),
  roleId: z.uuid().describe('Id of the role to assign'),
});

@DefineTool({
  name: 'assign_role_to_workspace_member',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Assign a role to a workspace member, replacing their current role.

You cannot change your own role, assign a role that does not allow user assignment (canBeAssignedToUsers=false), or remove the admin role from the last administrator.`,
})
export class AssignRoleToWorkspaceMemberTool extends BaseTool<
  typeof assignRoleToWorkspaceMemberInputSchema
> {
  readonly inputSchema = assignRoleToWorkspaceMemberInputSchema;

  constructor(private readonly userRoleService: UserRoleService) {
    super();
  }

  async execute(
    parameters: z.infer<typeof assignRoleToWorkspaceMemberInputSchema>,
    { workspaceId, userWorkspaceId }: ToolProviderContext,
  ): Promise<ToolOutput> {
    const { workspaceMember } =
      await this.userRoleService.assignRoleToWorkspaceMember({
        workspaceId,
        workspaceMemberId: parameters.workspaceMemberId,
        roleId: parameters.roleId,
        actingUserWorkspaceId: userWorkspaceId,
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
  }
}
