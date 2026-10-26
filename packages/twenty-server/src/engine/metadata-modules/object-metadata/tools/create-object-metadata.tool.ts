import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { createObjectMetadataInputSchema } from 'src/engine/metadata-modules/object-metadata/tools/schemas/create-object-metadata-input.schema';

@DefineTool({
  name: 'create_object_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Create a new object in the workspace data model.',
})
export class CreateObjectMetadataTool extends BaseTool<
  typeof createObjectMetadataInputSchema
> {
  readonly inputSchema = createObjectMetadataInputSchema;

  constructor(private readonly objectMetadataService: ObjectMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createObjectMetadataInputSchema
  >): Promise<ToolOutput> {
    const { icon, ...createObjectInput } = input;

    const flatObjectMetadata = await this.objectMetadataService.createOneObject(
      {
        createObjectInput: {
          ...createObjectInput,
          icon: normalizeIconName(icon),
        } as Parameters<
          typeof this.objectMetadataService.createOneObject
        >[0]['createObjectInput'],
        workspaceId,
      },
    );

    return {
      success: true,
      message: `Created the object "${flatObjectMetadata.nameSingular}".`,
      result: {
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        labelSingular: flatObjectMetadata.labelSingular,
      },
    };
  }
}
