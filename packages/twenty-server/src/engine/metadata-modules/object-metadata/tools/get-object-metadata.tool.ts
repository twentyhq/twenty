import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { METADATA_TOOL_EXCLUDED_FIELD_NAMES } from 'src/engine/core-modules/tool-provider/constants/metadata-tool-excluded-field-names.constant';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { compactMetadataOutput } from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

type InlinedObjectFieldSummary = {
  id: string;
  name: string;
  type: FieldMetadataType;
  label: string;
};

const OBJECT_STRIP_WHEN_NULLISH = [
  'overrides',
  'color',
  'duplicateCriteria',
  'shortcut',
  'imageIdentifierFieldMetadataId',
  'description',
  'icon',
];

const getObjectMetadataInputSchema = z.object({
  id: z.uuid().optional().describe('Object ID. Returns one object if set.'),
  objectName: z
    .string()
    .optional()
    .describe(
      'Filter by object name, singular or plural (e.g. "opportunity" or "opportunities"). Lets you locate an object by name in one call without scanning the full list.',
    ),
  includeFields: z
    .boolean()
    .default(false)
    .describe(
      'When true, each returned object includes its fields as a compact array of {id, name, type, label}. Use this to fetch an object and all the field ids you need in a single call (e.g. before building a dashboard) instead of a separate get_field_metadata call.',
    ),
  includeFullSystemObjects: z
    .boolean()
    .default(false)
    .describe(
      "Keep false (default) for listing or locating objects — system objects then return as compact {id, nameSingular, namePlural}, which is enough to find an object and read its id. Only set true when you specifically need a system object's full configuration (e.g. building a relation to workspaceMember).",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Max objects to return.'),
});

@DefineTool({
  name: 'get_object_metadata',
  category: ToolCategory.METADATA,
  requiredPermissionFlags: [PermissionFlagType.DATA_MODEL],
  icon: 'IconSettings',
  description:
    "List object metadata, returned as { objects: [...] } in the result. Filter to a single object by id or objectName (singular or plural). Set includeFields to also return each object's fields ({id, name, type, label}) — enough to build a dashboard or view without a separate get_field_metadata call. System objects are otherwise returned as compact {id, nameSingular, namePlural}. Keep includeFullSystemObjects at its default (false); only set it true when you specifically need a system object's full configuration.",
})
export class GetObjectMetadataTool extends BaseTool<
  typeof getObjectMetadataInputSchema
> {
  readonly inputSchema = getObjectMetadataInputSchema;

  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof getObjectMetadataInputSchema
  >): Promise<ToolOutput> {
    const flatObjectMetadatas =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        ...(input.id
          ? { where: { id: input.id } }
          : input.objectName
            ? {
                where: [
                  { nameSingular: input.objectName },
                  { namePlural: input.objectName },
                ],
              }
            : {}),
        take: input.limit ?? 100,
      });

    const fieldsByObjectId = input.includeFields
      ? await this.buildFieldsByObjectId(workspaceId)
      : undefined;

    const objects = flatObjectMetadatas.map((flatObjectMetadata) => {
      const dto = fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);

      const fields = fieldsByObjectId?.get(dto.id) ?? [];

      if (dto.isSystem && !input.includeFullSystemObjects) {
        return {
          id: dto.id,
          nameSingular: dto.nameSingular,
          namePlural: dto.namePlural,
          ...(input.includeFields ? { fields } : {}),
        };
      }

      return compactMetadataOutput(
        {
          ...dto,
          ...(input.includeFields ? { fields } : {}),
        },
        { stripWhenNullish: OBJECT_STRIP_WHEN_NULLISH },
      );
    });

    return {
      success: true,
      message: `Found ${objects.length} object(s).`,
      result: { objects },
    };
  }

  private async buildFieldsByObjectId(
    workspaceId: string,
  ): Promise<Map<string, InlinedObjectFieldSummary[]>> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldsByObjectId = new Map<string, InlinedObjectFieldSummary[]>();

    for (const fieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(fieldMetadata) ||
        METADATA_TOOL_EXCLUDED_FIELD_NAMES.has(fieldMetadata.name)
      ) {
        continue;
      }

      const existing =
        fieldsByObjectId.get(fieldMetadata.objectMetadataId) ?? [];

      existing.push({
        id: fieldMetadata.id,
        name: fieldMetadata.name,
        type: fieldMetadata.type,
        label: fieldMetadata.label ?? fieldMetadata.name,
      });
      fieldsByObjectId.set(fieldMetadata.objectMetadataId, existing);
    }

    return fieldsByObjectId;
  }
}
