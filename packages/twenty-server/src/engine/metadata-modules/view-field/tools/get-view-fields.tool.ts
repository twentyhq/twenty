import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';

const getViewFieldsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe(
      'The ID of the view to list fields for. Obtain this from get_views.',
    ),
});

@DefineTool({
  name: 'get_view_fields',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [],
  description:
    'List the columns (fields) displayed in a specific view. A view field controls which columns appear in a table or kanban view, their visibility, width, position, and aggregate operation. Use get_views first to find the view ID, then call this to inspect its column configuration.',
})
export class GetViewFieldsTool extends BaseTool<
  typeof getViewFieldsInputSchema
> {
  readonly inputSchema = getViewFieldsInputSchema;

  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof getViewFieldsInputSchema>): Promise<ToolOutput> {
    const viewFields = await this.viewFieldService.findByViewId(
      workspaceId,
      input.viewId,
    );

    const viewFieldsWithNames = await Promise.all(
      viewFields.map(async (viewField) => {
        const fieldName = await this.resolveFieldName({
          workspaceId,
          fieldMetadataId: viewField.fieldMetadataId,
        });

        return {
          id: viewField.id,
          fieldMetadataId: viewField.fieldMetadataId,
          fieldName: fieldName ?? null,
          viewId: viewField.viewId,
          isVisible: viewField.isVisible,
          size: viewField.size,
          position: viewField.position,
          aggregateOperation: viewField.aggregateOperation,
        };
      }),
    );

    return {
      success: true,
      message: `Found ${viewFieldsWithNames.length} view field(s)`,
      result: { viewFields: viewFieldsWithNames },
    };
  }

  private async resolveFieldName({
    workspaceId,
    fieldMetadataId,
  }: {
    workspaceId: string;
    fieldMetadataId: string;
  }): Promise<string | undefined> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
    })?.name;
  }
}
