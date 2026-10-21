import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { rolePermissionsSchema } from 'src/engine/metadata-modules/role/tools/schemas/role-permissions.schema';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';

const updateRoleInputSchema = z.object({
  roleId: z.uuid().describe('Id of the role to update'),
  update: rolePermissionsSchema
    .extend({
      label: z.string().min(1).optional().describe('New display name'),
      description: z.string().optional().describe('New description'),
      icon: z.string().optional().describe('New icon identifier'),
    })
    .describe('Fields to change; omitted fields are left untouched'),
});

@DefineTool({
  name: 'update_role',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Update an existing role's label, description, icon, global record permissions, settings access, or assignability.

System-managed roles (isEditable=false, like Admin) cannot be updated. Updates that would remove your own access to role management are rejected.`,
})
export class UpdateRoleTool extends BaseTool<typeof updateRoleInputSchema> {
  readonly inputSchema = updateRoleInputSchema;

  constructor(private readonly roleService: RoleService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, rolePermissionConfig },
  }: ToolExecuteArgs<typeof updateRoleInputSchema>): Promise<ToolOutput> {
    const role = await this.roleService.updateRole({
      workspaceId,
      input: {
        id: input.roleId,
        update: input.update,
      },
      actingRoleIds: getRoleIdsFromRolePermissionConfig(rolePermissionConfig),
    });

    return {
      success: true,
      message: `Role "${role.label}" updated`,
      result: toRoleSummary(role),
    };
  }
}
