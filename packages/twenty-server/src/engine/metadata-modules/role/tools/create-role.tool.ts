import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { rolePermissionsSchema } from 'src/engine/metadata-modules/role/tools/schemas/role-permissions.schema';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';

const createRoleInputSchema = rolePermissionsSchema.extend({
  label: z.string().min(1).describe('Display name of the role'),
  description: z.string().optional().describe('Optional role description'),
  icon: z
    .string()
    .optional()
    .describe('Optional icon identifier (e.g. "IconUser")'),
});

@DefineTool({
  name: 'create_role',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Create a new role in this workspace.

Global record permissions (canReadAllObjectRecords, canUpdateAllObjectRecords, ...) and settings access default to false; assignability to users, agents and API keys defaults to true.
After creating the role, use upsert_object_permissions to set per-object overrides and upsert_row_level_permission_rules to restrict which records are visible.
Granting write access on an object without read access is invalid.`,
})
export class CreateRoleTool extends BaseTool<typeof createRoleInputSchema> {
  readonly inputSchema = createRoleInputSchema;

  constructor(
    private readonly roleService: RoleService,
    private readonly applicationService: ApplicationService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createRoleInputSchema>): Promise<ToolOutput> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const role = await this.roleService.createRole({
      workspaceId,
      input,
      ownerFlatApplication: workspaceCustomFlatApplication,
    });

    return {
      success: true,
      message: `Role "${role.label}" created`,
      result: toRoleSummary(role),
    };
  }
}
