import { z } from 'zod';

import { type RoleToolContext } from 'src/engine/metadata-modules/role/tools/types/role-tool-context.type';
import { type RoleToolDependencies } from 'src/engine/metadata-modules/role/tools/types/role-tool-dependencies.type';
import { toObjectPermissionSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';
import { toRoleToolErrorMessage } from 'src/engine/metadata-modules/role/tools/utils/to-role-tool-error-message.util';

const upsertObjectPermissionsSchema = z.object({
  roleId: z.uuid().describe('Id of the role to set overrides on'),
  objectPermissions: z
    .array(
      z.object({
        objectMetadataId: z
          .uuid()
          .describe('Id of the object metadata the override applies to'),
        canReadObjectRecords: z
          .boolean()
          .optional()
          .describe('Override read access for this object'),
        canUpdateObjectRecords: z
          .boolean()
          .optional()
          .describe('Override update access for this object'),
        canSoftDeleteObjectRecords: z
          .boolean()
          .optional()
          .describe('Override soft-delete access for this object'),
        canDestroyObjectRecords: z
          .boolean()
          .optional()
          .describe('Override destroy access for this object'),
      }),
    )
    .min(1)
    .describe(
      "The complete set of per-object overrides to keep on the role. Overrides for objects omitted from this list are removed and fall back to the role's global permissions.",
    ),
});

type UpsertObjectPermissionsParams = z.infer<
  typeof upsertObjectPermissionsSchema
>;

export const createUpsertObjectPermissionsTool = (
  deps: Pick<RoleToolDependencies, 'objectPermissionService'>,
  context: RoleToolContext,
) => ({
  name: 'upsert_object_permissions' as const,
  description: `Set per-object permission overrides on a role, e.g. make an object read-only for that role.

IMPORTANT: this replaces the role's full override list. Include every override you want to keep; objects omitted from the list revert to the role's global permissions (canReadAllObjectRecords, ...). Use list_roles first to see current overrides.
Example read-only override: { objectMetadataId, canReadObjectRecords: true, canUpdateObjectRecords: false, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false }.
Granting write access without read access is rejected. System-managed roles (like Admin) cannot be changed.`,
  inputSchema: upsertObjectPermissionsSchema,
  execute: async (parameters: UpsertObjectPermissionsParams) => {
    try {
      const objectPermissions =
        await deps.objectPermissionService.upsertObjectPermissions({
          workspaceId: context.workspaceId,
          input: {
            roleId: parameters.roleId,
            objectPermissions: parameters.objectPermissions,
          },
        });

      return {
        success: true,
        message: 'Object permissions updated',
        result: {
          roleId: parameters.roleId,
          objectPermissions: objectPermissions.map(toObjectPermissionSummary),
        },
      };
    } catch (error) {
      const message = toRoleToolErrorMessage(error);

      return {
        success: false,
        message: `Failed to upsert object permissions: ${message}`,
        error: message,
      };
    }
  },
});
