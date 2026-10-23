import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { METADATA_TOOL_EXCLUDED_FIELD_NAMES } from 'src/engine/core-modules/tool-provider/constants/metadata-tool-excluded-field-names.constant';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { compactMetadataOutput } from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';

const FIELD_STRIP_WHEN_NULLISH = [
  'options',
  'settings',
  'defaultValue',
  'description',
  'icon',
  'deletedAt',
];

const FIELD_STRIP_WHEN_FALSE = ['isLabelSyncedWithName'];

// isUIEditable defaults to true, so only the non-default false value is informative
const FIELD_STRIP_WHEN_TRUE = ['isUIEditable'];

const getFieldMetadataInputSchema = z.object({
  id: z.uuid().optional().describe('Field ID. Returns one field if set.'),
  objectMetadataId: z.uuid().optional().describe('Filter by object ID.'),
  objectName: z
    .string()
    .optional()
    .describe(
      'Filter by object name, singular or plural (e.g. "opportunity" or "opportunities"). Convenient alternative to objectMetadataId so you do not need to resolve the object id first.',
    ),
  includeFullSystemFields: z
    .boolean()
    .default(false)
    .describe(
      "Keep false (default) for listing or inspecting fields — system fields then return as compact {id, name, type}, which is enough to know which fields exist and their types. Only set true when you specifically need a system field's full configuration (settings, defaultValue, relation targets).",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Max fields to return.'),
});

@DefineTool({
  name: 'get_field_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description:
    "Returns { fields: [...] } in the result. System fields are returned as compact {id, name, type} — enough to know which fields exist and their types. Keep includeFullSystemFields at its default (false); only set it true when you specifically need a system field's full configuration (settings, defaultValue, relation targets). Internal fields (searchVector, position, updatedBy) are excluded.",
})
export class GetFieldMetadataTool extends BaseTool<
  typeof getFieldMetadataInputSchema
> {
  readonly inputSchema = getFieldMetadataInputSchema;

  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly metadataToolIdentifierService: MetadataToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof getFieldMetadataInputSchema>): Promise<ToolOutput> {
    const objectMetadataId =
      input.objectMetadataId ??
      (input.objectName
        ? await this.metadataToolIdentifierService.getObjectMetadataIdOrThrow({
            workspaceId,
            objectName: input.objectName,
          })
        : undefined);

    const rawResults = await this.fieldMetadataService.findManyWithinWorkspace({
      workspaceId,
      fieldMetadataId: input.id,
      objectMetadataId,
      limit: input.limit ?? 100,
    });

    const compactedFields = (rawResults as unknown as Record<string, unknown>[])
      .filter(
        (field) =>
          !METADATA_TOOL_EXCLUDED_FIELD_NAMES.has(field.name as string),
      )
      .map((field) => {
        if (field.isSystem && !input.includeFullSystemFields) {
          return {
            id: field.id,
            name: field.name,
            type: field.type,
          };
        }

        return compactMetadataOutput(
          { ...field },
          {
            stripWhenNullish: FIELD_STRIP_WHEN_NULLISH,
            stripWhenFalse: FIELD_STRIP_WHEN_FALSE,
            stripWhenTrue: FIELD_STRIP_WHEN_TRUE,
          },
        );
      });

    return {
      success: true,
      message: `Found ${compactedFields.length} field(s).`,
      result: { fields: compactedFields },
    };
  }
}
