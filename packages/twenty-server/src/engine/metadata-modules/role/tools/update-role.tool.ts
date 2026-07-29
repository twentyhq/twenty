import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import {
  assertRoleIsEditable,
  assertRoleUpdateDoesNotLockOutCaller,
  findFlatRoleForToolOrThrow,
} from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';

const updateRoleSchema = z.object({
  roleId: z.string().uuid().describe('Id of the role to update'),
  update: z
    .object({
      label: z.string().min(1).optional().describe('New display name'),
      description: z.string().optional().describe('New description'),
      icon: z.string().optional().describe('New icon identifier'),
      canUpdateAllSettings: z
        .boolean()
        .optional()
        .describe('Grants or revokes full settings/admin access'),
      canAccessAllTools: z
        .boolean()
        .optional()
        .describe('Grants or revokes access to all workspace tools'),
      canReadAllObjectRecords: z
        .boolean()
        .optional()
        .describe('Default read access on all objects'),
      canUpdateAllObjectRecords: z
        .boolean()
        .optional()
        .describe('Default update access on all objects'),
      canSoftDeleteAllObjectRecords: z
        .boolean()
        .optional()
        .describe('Default soft-delete access on all objects'),
      canDestroyAllObjectRecords: z
        .boolean()
        .optional()
        .describe('Default destroy access on all objects'),
      canBeAssignedToUsers: z
        .boolean()
        .optional()
        .describe('Whether the role can be assigned to users'),
      canBeAssignedToAgents: z
        .boolean()
        .optional()
        .describe('Whether the role can be assigned to AI agents'),
      canBeAssignedToApiKeys: z
        .boolean()
        .optional()
        .describe('Whether the role can be assigned to API keys'),
    })
    .describe('Fields to change; omitted fields are left untouched'),
});

type UpdateRoleParams = z.infer<typeof updateRoleSchema>;

export const createUpdateRoleTool = (
  deps: Pick<
    RoleToolDependencies,
    'roleService' | 'flatEntityMapsCacheService'
  >,
  context: RoleToolContext,
) => ({
  name: 'update_role' as const,
  description: `Update an existing role's label, description, icon, global record permissions, settings access, or assignability.

System-managed roles (isEditable=false, like Admin) cannot be updated. Updates that would remove your own access to role management are rejected.`,
  inputSchema: updateRoleSchema,
  execute: async (parameters: UpdateRoleParams) => {
    try {
      const { flatRoleMaps, flatRolePermissionFlagMaps } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatRoleMaps', 'flatRolePermissionFlagMaps'],
          },
        );

      const flatRole = findFlatRoleForToolOrThrow({
        roleId: parameters.roleId,
        flatRoleMaps,
      });

      assertRoleIsEditable(flatRole);
      assertRoleUpdateDoesNotLockOutCaller({
        flatRole,
        canUpdateAllSettingsUpdate: parameters.update.canUpdateAllSettings,
        callerRoleIds: context.callerRoleIds,
        flatRolePermissionFlagMaps,
      });

      const role = await deps.roleService.updateRole({
        workspaceId: context.workspaceId,
        input: {
          id: parameters.roleId,
          update: parameters.update,
        },
      });

      return {
        success: true,
        message: `Role "${role.label}" updated`,
        result: {
          id: role.id,
          label: role.label,
          description: role.description,
          canUpdateAllSettings: role.canUpdateAllSettings,
          canAccessAllTools: role.canAccessAllTools,
          canReadAllObjectRecords: role.canReadAllObjectRecords,
          canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
          canBeAssignedToUsers: role.canBeAssignedToUsers,
          canBeAssignedToAgents: role.canBeAssignedToAgents,
          canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to update role: ${message}`,
        error: message,
      };
    }
  },
});
