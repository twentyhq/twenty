import { z } from 'zod';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';

const listRolesSchema = z.object({
  includeRowLevelPermissionRules: z
    .boolean()
    .optional()
    .describe(
      "When true, include each role's row-level permission predicates and predicate groups (enterprise feature; empty when disabled).",
    ),
});

type ListRolesParams = z.infer<typeof listRolesSchema>;

const toRoleSummary = (role: RoleDTO) => ({
  id: role.id,
  label: role.label,
  description: role.description,
  icon: role.icon,
  isEditable: role.isEditable,
  canUpdateAllSettings: role.canUpdateAllSettings,
  canAccessAllTools: role.canAccessAllTools,
  canReadAllObjectRecords: role.canReadAllObjectRecords,
  canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
  canBeAssignedToUsers: role.canBeAssignedToUsers,
  canBeAssignedToAgents: role.canBeAssignedToAgents,
  canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
  objectPermissions: role.objectPermissions?.map((objectPermission) => ({
    objectMetadataId: objectPermission.objectMetadataId,
    canReadObjectRecords: objectPermission.canReadObjectRecords,
    canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
    canSoftDeleteObjectRecords: objectPermission.canSoftDeleteObjectRecords,
    canDestroyObjectRecords: objectPermission.canDestroyObjectRecords,
  })),
  permissionFlags: role.permissionFlags?.map(
    (permissionFlag) => permissionFlag.flag,
  ),
});

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
      const roles = await deps.roleService.getWorkspaceRoles(
        context.workspaceId,
      );

      if (!parameters.includeRowLevelPermissionRules) {
        return {
          success: true,
          message: `Found ${roles.length} role${roles.length === 1 ? '' : 's'}`,
          result: { roles: roles.map(toRoleSummary) },
        };
      }

      const allPredicates =
        await deps.rowLevelPermissionPredicateService.findByWorkspaceId(
          context.workspaceId,
        );

      const rolesWithRules = await Promise.all(
        roles.map(async (role) => ({
          ...toRoleSummary(role),
          rowLevelPermissionPredicates: allPredicates.filter(
            (predicate) => predicate.roleId === role.id,
          ),
          rowLevelPermissionPredicateGroups:
            await deps.rowLevelPermissionPredicateGroupService.findByRole(
              context.workspaceId,
              role.id,
            ),
        })),
      );

      return {
        success: true,
        message: `Found ${roles.length} role${roles.length === 1 ? '' : 's'}`,
        result: { roles: rolesWithRules },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to list roles: ${message}`,
        error: message,
      };
    }
  },
});
