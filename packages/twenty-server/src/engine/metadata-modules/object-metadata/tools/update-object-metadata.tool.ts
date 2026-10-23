import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { updateObjectMetadataInputSchema } from 'src/engine/metadata-modules/object-metadata/tools/schemas/update-object-metadata-input.schema';

@DefineTool({
  name: 'update_object_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Update an object. Provide object ID and properties to change.',
})
export class UpdateObjectMetadataTool extends BaseTool<
  typeof updateObjectMetadataInputSchema
> {
  readonly inputSchema = updateObjectMetadataInputSchema;

  constructor(private readonly objectMetadataService: ObjectMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof updateObjectMetadataInputSchema
  >): Promise<ToolOutput> {
    const { id, icon, ...update } = input;
    const normalizedIcon = normalizeIconName(icon);

    const flatObjectMetadata = await this.objectMetadataService.updateOneObject(
      {
        updateObjectInput: {
          id,
          update: {
            ...update,
            ...(isDefined(normalizedIcon) ? { icon: normalizedIcon } : {}),
          },
        },
        workspaceId,
      },
    );

    return {
      success: true,
      message: `Updated the object "${flatObjectMetadata.nameSingular}".`,
      result: {
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        labelSingular: flatObjectMetadata.labelSingular,
      },
    };
  }
}
