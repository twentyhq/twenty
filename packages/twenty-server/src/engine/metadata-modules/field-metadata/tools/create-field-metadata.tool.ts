import { ToolCategory } from 'twenty-shared/ai';
import {
  FIELD_TYPE_DEFAULT_ICONS,
  PermissionFlagType,
} from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { createFieldMetadataInputSchema } from 'src/engine/metadata-modules/field-metadata/tools/schemas/create-field-metadata-input.schema';
import { normalizeRelationCreationPayloadIcon } from 'src/engine/metadata-modules/field-metadata/tools/utils/normalize-relation-creation-payload-icon.util';

@DefineTool({
  name: 'create_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Create a new field on an object.',
})
export class CreateFieldMetadataTool extends BaseTool<
  typeof createFieldMetadataInputSchema
> {
  readonly inputSchema = createFieldMetadataInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createFieldMetadataInputSchema
  >): Promise<ToolOutput> {
    const { icon, relationCreationPayload, ...createFieldInput } = input;

    const flatFieldMetadata = await this.fieldMetadataService.createOneField({
      createFieldInput: {
        ...createFieldInput,
        icon: normalizeIconName(icon) ?? FIELD_TYPE_DEFAULT_ICONS[input.type],
        relationCreationPayload: normalizeRelationCreationPayloadIcon(
          relationCreationPayload,
        ),
      } as Parameters<
        typeof this.fieldMetadataService.createOneField
      >[0]['createFieldInput'],
      workspaceId,
    });

    return {
      success: true,
      message: `Created the field "${flatFieldMetadata.name}".`,
      result: {
        id: flatFieldMetadata.id,
        name: flatFieldMetadata.name,
        label: flatFieldMetadata.label,
        type: flatFieldMetadata.type,
        objectMetadataId: flatFieldMetadata.objectMetadataId,
      },
    };
  }
}
