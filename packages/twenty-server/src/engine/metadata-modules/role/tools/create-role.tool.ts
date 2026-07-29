import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';

const createRoleSchema = z.object({
  label: z.string().min(1).describe('Display name of the role'),
  description: z.string().optional().describe('Optional role description'),
  icon: z
    .string()
    .optional()
    .describe('Optional icon identifier (e.g. "IconUser")'),
  canUpdateAllSettings: z
    .boolean()
    .optional()
    .describe('Grants full settings/admin access. Defaults to false.'),
  canAccessAllTools: z
    .boolean()
    .optional()
    .describe('Grants access to all workspace tools. Defaults to false.'),
  canReadAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default read access on all objects. Defaults to false.'),
  canUpdateAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default update access on all objects. Defaults to false.'),
  canSoftDeleteAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default soft-delete access on all objects. Defaults to false.'),
  canDestroyAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default destroy access on all objects. Defaults to false.'),
  canBeAssignedToUsers: z
    .boolean()
    .optional()
    .describe('Whether the role can be assigned to users. Defaults to true.'),
  canBeAssignedToAgents: z
    .boolean()
    .optional()
    .describe(
      'Whether the role can be assigned to AI agents. Defaults to true.',
    ),
  canBeAssignedToApiKeys: z
    .boolean()
    .optional()
    .describe(
      'Whether the role can be assigned to API keys. Defaults to true.',
    ),
});

type CreateRoleParams = z.infer<typeof createRoleSchema>;

export const createCreateRoleTool = (
  deps: Pick<RoleToolDependencies, 'roleService' | 'applicationService'>,
  context: RoleToolContext,
) => ({
  name: 'create_role' as const,
  description: `Create a new role in this workspace.

Global record permissions (canReadAllObjectRecords, canUpdateAllObjectRecords, ...) default to false. After creating the role, use upsert_object_permissions to set per-object overrides and upsert_row_level_permission_rules to restrict which records are visible.
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
        message: `Failed to create role: ${message}`,
        error: message,
      };
    }
  },
});
