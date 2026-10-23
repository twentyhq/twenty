import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

const listRolesInputSchema = z.object({
  includeRowLevelPermissionRules: z
    .boolean()
    .optional()
    .describe(
      "When true, include each role's row-level permission predicates and predicate groups (enterprise feature; empty when disabled).",
    ),
});

@DefineTool({
  name: 'list_roles',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `List all roles of this workspace with their permissions.

Returns for each role: global record permissions (canReadAllObjectRecords, ...), settings access (canUpdateAllSettings), per-object permission overrides, permission flags, and assignability (users, agents, API keys).
Roles with isEditable=false (like Admin) are system-managed and cannot be changed.`,
})
export class ListRolesTool extends BaseTool<typeof listRolesInputSchema> {
  readonly inputSchema = listRolesInputSchema;

  constructor(
    private readonly roleService: RoleService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    private readonly rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof listRolesInputSchema>): Promise<ToolOutput> {
    if (!input.includeRowLevelPermissionRules) {
      const roles = await this.roleService.getWorkspaceRoles(workspaceId);

      return {
        success: true,
        message: `Found ${roles.length} role${roles.length === 1 ? '' : 's'}`,
        result: { roles: roles.map(toRoleSummary) },
      };
    }

    const [roles, allPredicates, allPredicateGroups] = await Promise.all([
      this.roleService.getWorkspaceRoles(workspaceId),
      this.rowLevelPermissionPredicateService.findByWorkspaceId(workspaceId),
      this.rowLevelPermissionPredicateGroupService.findByWorkspaceId(
        workspaceId,
      ),
    ]);

    const rolesWithRules = roles.map((role) => ({
      ...toRoleSummary(role),
      rowLevelPermissionPredicates: allPredicates.filter(
        (predicate) => predicate.roleId === role.id,
      ),
      rowLevelPermissionPredicateGroups: allPredicateGroups.filter(
        (predicateGroup) => predicateGroup.roleId === role.id,
      ),
    }));

    return {
      success: true,
      message: `Found ${roles.length} role${roles.length === 1 ? '' : 's'}`,
      result: { roles: rolesWithRules },
    };
  }
}
