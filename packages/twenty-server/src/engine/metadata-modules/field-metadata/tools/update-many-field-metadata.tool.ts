import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { updateFieldMetadataInputSchema } from 'src/engine/metadata-modules/field-metadata/tools/schemas/update-field-metadata-input.schema';

const updateManyFieldMetadataInputSchema = z.object({
  fields: z
    .array(updateFieldMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Fields to update (max 20).'),
});

@DefineTool({
  name: 'update_many_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description:
    'Update multiple field metadata at once. More efficient than calling update_field_metadata multiple times. Each item must include the field ID and the properties to update.',
})
export class UpdateManyFieldMetadataTool extends BaseTool<
  typeof updateManyFieldMetadataInputSchema
> {
  readonly inputSchema = updateManyFieldMetadataInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof updateManyFieldMetadataInputSchema
  >): Promise<ToolOutput> {
    await Promise.all(
      input.fields.map(async ({ id, icon, ...update }) => {
        const normalizedIcon = normalizeIconName(icon);

        await this.fieldMetadataService.updateOneField({
          updateFieldInput: {
            id,
            ...update,
            ...(isDefined(normalizedIcon) ? { icon: normalizedIcon } : {}),
          } as Parameters<
            typeof this.fieldMetadataService.updateOneField
          >[0]['updateFieldInput'],
          workspaceId,
        });
      }),
    );

    return {
      success: true,
      message: `Updated ${input.fields.length} field(s).`,
    };
  }
}
