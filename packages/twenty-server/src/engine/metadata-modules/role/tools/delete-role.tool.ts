import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';

const deleteRoleInputSchema = z.object({
  roleId: z.uuid().describe('Id of the role to delete'),
});

@DefineTool({
  name: 'delete_role',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Delete a role. Members, agents and API keys assigned to it are reassigned to the workspace default role.

System-managed roles (isEditable=false, like Admin), the workspace default role, and roles you are assigned to cannot be deleted.`,
})
export class DeleteRoleTool extends BaseTool<typeof deleteRoleInputSchema> {
  readonly inputSchema = deleteRoleInputSchema;

  constructor(private readonly roleService: RoleService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, rolePermissionConfig },
  }: ToolExecuteArgs<typeof deleteRoleInputSchema>): Promise<ToolOutput> {
    const deletedRole = await this.roleService.deleteRole({
      roleId: input.roleId,
      workspaceId,
      actingRoleIds: getRoleIdsFromRolePermissionConfig(rolePermissionConfig),
    });

    return {
      success: true,
      message: `Role "${deletedRole.label}" deleted`,
      result: { id: deletedRole.id, label: deletedRole.label },
    };
  }
}
