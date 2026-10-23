import { ToolCategory } from 'twenty-shared/ai';
import {
  FIELD_TYPE_DEFAULT_ICONS,
  PermissionFlagType,
} from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { createFieldMetadataInputSchema } from 'src/engine/metadata-modules/field-metadata/tools/schemas/create-field-metadata-input.schema';
import { normalizeRelationCreationPayloadIcon } from 'src/engine/metadata-modules/field-metadata/tools/utils/normalize-relation-creation-payload-icon.util';

const createManyFieldMetadataInputSchema = z.object({
  fields: z
    .array(createFieldMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Fields to create (max 20).'),
});

@DefineTool({
  name: 'create_many_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description:
    'Create multiple field metadata at once on one or more objects. More efficient than calling create_field_metadata multiple times. Each item follows the same schema as create_field_metadata.',
})
export class CreateManyFieldMetadataTool extends BaseTool<
  typeof createManyFieldMetadataInputSchema
> {
  readonly inputSchema = createManyFieldMetadataInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createManyFieldMetadataInputSchema
  >): Promise<ToolOutput> {
    await this.fieldMetadataService.createManyFields({
      createFieldInputs: input.fields.map(
        ({ icon, relationCreationPayload, ...createFieldInput }) => ({
          ...createFieldInput,
          icon:
            normalizeIconName(icon) ??
            FIELD_TYPE_DEFAULT_ICONS[createFieldInput.type],
          relationCreationPayload: normalizeRelationCreationPayloadIcon(
            relationCreationPayload,
          ),
        }),
      ) as Parameters<
        typeof this.fieldMetadataService.createManyFields
      >[0]['createFieldInputs'],
      workspaceId,
    });

    return {
      success: true,
      message: `Created ${input.fields.length} field(s).`,
    };
  }
}
