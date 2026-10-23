import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';

const deleteFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Field ID'),
});

@DefineTool({
  name: 'delete_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Delete a field by ID.',
})
export class DeleteFieldMetadataTool extends BaseTool<
  typeof deleteFieldMetadataInputSchema
> {
  readonly inputSchema = deleteFieldMetadataInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof deleteFieldMetadataInputSchema
  >): Promise<ToolOutput> {
    const flatFieldMetadata = await this.fieldMetadataService.deleteOneField({
      deleteOneFieldInput: { id: input.id },
      workspaceId,
    });

    return {
      success: true,
      message: `Deleted the field "${flatFieldMetadata.name}".`,
      result: { id: flatFieldMetadata.id, deleted: true },
    };
  }
}
