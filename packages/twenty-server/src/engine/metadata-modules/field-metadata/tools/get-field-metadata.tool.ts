import { ToolCategory } from 'twenty-shared/ai';
import {
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { METADATA_TOOL_EXCLUDED_FIELD_NAMES } from 'src/engine/core-modules/tool-provider/constants/metadata-tool-excluded-field-names.constant';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { compactMetadataOutput } from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FIELD_METADATA_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-read-access-policy.constant';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { printFormulaFieldText } from 'src/engine/metadata-modules/formula-field/utils/print-formula-field-text.util';
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FIELD_STRIP_WHEN_NULLISH = [
  'options',
  'settings',
  'formula',
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
  isReadOnly: true,
  category: ToolCategory.METADATA,
  accessPolicy: FIELD_METADATA_READ_ACCESS_POLICY,
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
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const { flatObjectMetadataMaps, flatFieldMetadataMapsOrm } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);
    const printFormula = (field: (typeof rawResults)[number]) => {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: field.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(field.formula) || !isDefined(flatObjectMetadata)) {
        return field.formula;
      }

      const formulaText = printFormulaFieldText({
        formula: field.formula,
        fields: buildFormulaFieldDescriptorsFromFlatEntityMaps({
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
        }).filter(({ name }) => name !== field.name),
      });

      return isDefined(formulaText)
        ? {
            ...formulaText,
            evaluation: getFieldMetadataFormulaEvaluation({
              formula: field.formula,
            }),
          }
        : field.formula;
    };

    const compactedFields = rawResults
      .filter((field) => !METADATA_TOOL_EXCLUDED_FIELD_NAMES.has(field.name))
      .map((field) => {
        if (field.isSystem && !input.includeFullSystemFields) {
          return {
            id: field.id,
            name: field.name,
            type: field.type,
          };
        }

        return compactMetadataOutput(
          { ...field, formula: printFormula(field) },
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
