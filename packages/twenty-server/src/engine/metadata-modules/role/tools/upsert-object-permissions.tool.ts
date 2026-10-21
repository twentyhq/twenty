import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { toObjectPermissionSummary } from 'src/engine/metadata-modules/role/tools/utils/to-role-summary.util';

const upsertObjectPermissionsInputSchema = z.object({
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

@DefineTool({
  name: 'upsert_object_permissions',
  category: ToolCategory.ROLE,
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  description: `Set per-object permission overrides on a role, e.g. make an object read-only for that role.

IMPORTANT: this replaces the role's full override list. Include every override you want to keep; objects omitted from the list revert to the role's global permissions (canReadAllObjectRecords, ...). Use list_roles first to see current overrides.
Example read-only override: { objectMetadataId, canReadObjectRecords: true, canUpdateObjectRecords: false, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false }.
Granting write access without read access is rejected. System-managed roles (like Admin) cannot be changed.`,
})
export class UpsertObjectPermissionsTool extends BaseTool<
  typeof upsertObjectPermissionsInputSchema
> {
  readonly inputSchema = upsertObjectPermissionsInputSchema;

  constructor(
    private readonly objectPermissionService: ObjectPermissionService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof upsertObjectPermissionsInputSchema
  >): Promise<ToolOutput> {
    const objectPermissions =
      await this.objectPermissionService.upsertObjectPermissions({
        workspaceId,
        input: {
          roleId: input.roleId,
          objectPermissions: input.objectPermissions,
        },
      });

    return {
      success: true,
      message: 'Object permissions updated',
      result: {
        roleId: input.roleId,
        objectPermissions: objectPermissions.map(toObjectPermissionSummary),
      },
    };
  }
}
