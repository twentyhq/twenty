import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { OBJECT_METADATA_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-write-access-policy.constant';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

const deleteObjectMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Object ID'),
});

@DefineTool({
  name: 'delete_object_metadata',
  category: ToolCategory.METADATA,
  accessPolicy: OBJECT_METADATA_WRITE_ACCESS_POLICY,
  icon: 'IconSettings',
  description: 'Delete an object by ID. Also deletes associated fields.',
})
export class DeleteObjectMetadataTool extends BaseTool<
  typeof deleteObjectMetadataInputSchema
> {
  readonly inputSchema = deleteObjectMetadataInputSchema;

  constructor(private readonly objectMetadataService: ObjectMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof deleteObjectMetadataInputSchema
  >): Promise<ToolOutput> {
    const flatObjectMetadata = await this.objectMetadataService.deleteOneObject(
      {
        deleteObjectInput: { id: input.id },
        workspaceId,
      },
    );

    return {
      success: true,
      message: `Deleted the object "${flatObjectMetadata.nameSingular}".`,
      result: { id: flatObjectMetadata.id, deleted: true },
    };
  }
}
