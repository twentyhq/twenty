import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const listRolesSchema = z.object({
  includeRowLevelPermissionRules: z
    .boolean()
    .optional()
    .describe(
      "When true, include each role's row-level permission predicates and predicate groups (enterprise feature; empty when disabled).",
    ),
});

type ListRolesParams = z.infer<typeof listRolesSchema>;

export const createListRolesTool = (
  deps: Pick<
    RoleToolDependencies,
    | 'roleService'
    | 'rowLevelPermissionPredicateService'
    | 'rowLevelPermissionPredicateGroupService'
  >,
  context: RoleToolContext,
) => ({
  name: 'list_roles' as const,
  description: `List all roles of this workspace with their permissions.

Returns for each role: global record permissions (canReadAllObjectRecords, ...), settings access (canUpdateAllSettings), per-object permission overrides, permission flags, and assignability (users, agents, API keys).
Roles with isEditable=false (like Admin) are system-managed and cannot be changed.`,
  inputSchema: listRolesSchema,
  execute: async (parameters: ListRolesParams) => {
    try {
      if (!parameters.includeRowLevelPermissionRules) {
        const roles = await deps.roleService.getWorkspaceRoles(
          context.workspaceId,
        );

        return {
          success: true,
          message: `Found ${roles.length} role${roles.length === 1 ? '' : 's'}`,
          result: { roles: roles.map(toRoleSummary) },
        };
      }

      const [roles, allPredicates, allPredicateGroups] = await Promise.all([
        deps.roleService.getWorkspaceRoles(context.workspaceId),
        deps.rowLevelPermissionPredicateService.findByWorkspaceId(
          context.workspaceId,
        ),
        deps.rowLevelPermissionPredicateGroupService.findByWorkspaceId(
          context.workspaceId,
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
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to list roles: ${message}`,
        error: message,
      };
    }
  },
});
