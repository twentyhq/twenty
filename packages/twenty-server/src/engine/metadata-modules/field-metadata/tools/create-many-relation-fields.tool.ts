import { ToolCategory } from 'twenty-shared/ai';
import {
  FIELD_TYPE_DEFAULT_ICONS,
  PermissionFlagType,
} from 'twenty-shared/constants';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { RELATION_TYPE_DESCRIPTION } from 'src/engine/metadata-modules/field-metadata/tools/constants/relation-type-description.constant';

const createManyRelationFieldsInputSchema = z.object({
  relations: z
    .array(
      z.object({
        objectMetadataId: z.string().uuid().describe('Source object ID'),
        name: z.string().describe('Field name (camelCase)'),
        label: z.string().describe('Display label'),
        description: z.string().optional().describe('Description'),
        icon: z
          .string()
          .optional()
          .describe('Tabler icon name for the relation field (e.g. IconUsers)'),
        type: z.nativeEnum(RelationType).describe(RELATION_TYPE_DESCRIPTION),
        targetObjectMetadataId: z.string().uuid().describe('Target object ID'),
        targetFieldLabel: z.string().describe('Inverse field label'),
        targetFieldIcon: z
          .string()
          .describe(
            'Inverse field Tabler icon name (e.g. IconBuildingSkyscraper)',
          ),
      }),
    )
    .min(1)
    .max(20)
    .describe('Relations to create (max 20).'),
});

@DefineTool({
  name: 'create_many_relation_fields',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description: 'Create multiple relation fields between objects at once.',
})
export class CreateManyRelationFieldsTool extends BaseTool<
  typeof createManyRelationFieldsInputSchema
> {
  readonly inputSchema = createManyRelationFieldsInputSchema;

  constructor(private readonly fieldMetadataService: FieldMetadataService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createManyRelationFieldsInputSchema
  >): Promise<ToolOutput> {
    await this.fieldMetadataService.createManyFields({
      createFieldInputs: input.relations.map((relation) => ({
        objectMetadataId: relation.objectMetadataId,
        type: FieldMetadataType.RELATION,
        name: relation.name,
        label: relation.label,
        description: relation.description,
        icon:
          normalizeIconName(relation.icon) ??
          FIELD_TYPE_DEFAULT_ICONS[FieldMetadataType.RELATION],
        relationCreationPayload: {
          type: relation.type,
          targetObjectMetadataId: relation.targetObjectMetadataId,
          targetFieldLabel: relation.targetFieldLabel,
          targetFieldIcon:
            normalizeIconName(relation.targetFieldIcon) ??
            FIELD_TYPE_DEFAULT_ICONS[FieldMetadataType.RELATION],
        },
      })) as Parameters<
        typeof this.fieldMetadataService.createManyFields
      >[0]['createFieldInputs'],
      workspaceId,
    });

    return {
      success: true,
      message: `Created ${input.relations.length} relation field(s).`,
    };
  }
}
