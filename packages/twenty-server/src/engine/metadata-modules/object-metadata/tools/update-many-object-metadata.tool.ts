import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { updateObjectMetadataInputSchema } from 'src/engine/metadata-modules/object-metadata/tools/schemas/update-object-metadata-input.schema';

const updateManyObjectMetadataInputSchema = z.object({
  objects: z
    .array(updateObjectMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Objects to update (max 20).'),
});

@DefineTool({
  name: 'update_many_object_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description:
    'Update multiple objects at once. Batch version of update_object_metadata. Applies the whole batch in one migration, so a rename (nameSingular or namePlural) or a labelIdentifierFieldMetadataId change cannot share a batch with another object: send each of those as its own call.',
})
export class UpdateManyObjectMetadataTool extends BaseTool<
  typeof updateManyObjectMetadataInputSchema
> {
  readonly inputSchema = updateManyObjectMetadataInputSchema;

  constructor(private readonly objectMetadataService: ObjectMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof updateManyObjectMetadataInputSchema
  >): Promise<ToolOutput> {
    await this.objectMetadataService.updateManyObjects({
      updateObjectInputs: input.objects.map(({ id, icon, ...update }) => {
        const normalizedIcon = normalizeIconName(icon);

        return {
          id,
          update: {
            ...update,
            ...(isDefined(normalizedIcon) ? { icon: normalizedIcon } : {}),
          },
        };
      }),
      workspaceId,
    });

    return {
      success: true,
      message: `Updated ${input.objects.length} object(s).`,
    };
  }
}
