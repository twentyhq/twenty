import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { updateFieldMetadataInputSchema } from 'src/engine/metadata-modules/field-metadata/tools/schemas/update-field-metadata-input.schema';

@DefineTool({
  name: 'update_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Update a field. Provide field ID and properties to change.',
})
export class UpdateFieldMetadataTool extends BaseTool<
  typeof updateFieldMetadataInputSchema
> {
  readonly inputSchema = updateFieldMetadataInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof updateFieldMetadataInputSchema
  >): Promise<ToolOutput> {
    const { id, icon, ...update } = input;
    const normalizedIcon = normalizeIconName(icon);

    const flatFieldMetadata = await this.fieldMetadataService.updateOneField({
      updateFieldInput: {
        id,
        ...update,
        ...(isDefined(normalizedIcon) ? { icon: normalizedIcon } : {}),
      } as Parameters<
        typeof this.fieldMetadataService.updateOneField
      >[0]['updateFieldInput'],
      workspaceId,
    });

    return {
      success: true,
      message: `Updated the field "${flatFieldMetadata.name}".`,
      result: {
        id: flatFieldMetadata.id,
        name: flatFieldMetadata.name,
        label: flatFieldMetadata.label,
        type: flatFieldMetadata.type,
      },
    };
  }
}
