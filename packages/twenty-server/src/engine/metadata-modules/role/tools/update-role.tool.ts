import { z } from 'zod';

import { rolePermissionsSchema } from 'src/engine/metadata-modules/role/tools/schemas/role-permissions.schema';
import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import {
  assertRoleIsEditable,
  assertRoleUpdateDoesNotLockOutCaller,
  findFlatRoleForToolOrThrow,
} from 'src/engine/metadata-modules/role/tools/utils/role-tool-safeguards.util';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const updateRoleSchema = z.object({
  roleId: z.uuid().describe('Id of the role to update'),
  update: rolePermissionsSchema
    .extend({
      label: z.string().min(1).optional().describe('New display name'),
      description: z.string().optional().describe('New description'),
      icon: z.string().optional().describe('New icon identifier'),
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
        result: toRoleSummary(role),
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to update role: ${message}`,
        error: message,
      };
    }
  },
});
