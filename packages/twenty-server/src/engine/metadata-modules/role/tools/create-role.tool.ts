import { z } from 'zod';

import { rolePermissionsSchema } from 'src/engine/metadata-modules/role/tools/schemas/role-permissions.schema';
import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { toRoleSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const createRoleSchema = rolePermissionsSchema.extend({
  label: z.string().min(1).describe('Display name of the role'),
  description: z.string().optional().describe('Optional role description'),
  icon: z
    .string()
    .optional()
    .describe('Optional icon identifier (e.g. "IconUser")'),
});

type CreateRoleParams = z.infer<typeof createRoleSchema>;

export const createCreateRoleTool = (
  deps: Pick<RoleToolDependencies, 'roleService' | 'applicationService'>,
  context: RoleToolContext,
) => ({
  name: 'create_role' as const,
  description: `Create a new role in this workspace.

Global record permissions (canReadAllObjectRecords, canUpdateAllObjectRecords, ...) and settings access default to false; assignability to users, agents and API keys defaults to true.
After creating the role, use upsert_object_permissions to set per-object overrides and upsert_row_level_permission_rules to restrict which records are visible.
Granting write access on an object without read access is invalid.`,
  inputSchema: createRoleSchema,
  execute: async (parameters: CreateRoleParams) => {
    try {
      const { workspaceCustomFlatApplication } =
        await deps.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId: context.workspaceId },
        );

      const role = await deps.roleService.createRole({
        workspaceId: context.workspaceId,
        input: parameters,
        ownerFlatApplication: workspaceCustomFlatApplication,
      });

      return {
        success: true,
        message: `Role "${role.label}" created`,
        result: toRoleSummary(role),
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to create role: ${message}`,
        error: message,
      };
    }
  },
});
