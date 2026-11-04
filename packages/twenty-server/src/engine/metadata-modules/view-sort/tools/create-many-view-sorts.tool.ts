import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { createViewSortInputSchema } from 'src/engine/metadata-modules/view-sort/tools/schemas/create-view-sort-input.schema';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';
import { VIEW_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/view/constants/view-write-access-policy.constant';

const createManyViewSortsInputSchema = z.object({
  sorts: z
    .array(createViewSortInputSchema)
    .min(1)
    .max(10)
    .describe('Array of sorts to create (1-10 items)'),
});

@DefineTool({
  name: 'create_many_view_sorts',
  category: ToolCategory.VIEW,
  accessPolicy: VIEW_WRITE_ACCESS_POLICY,
  description:
    'Add multiple sorts to a view in one call. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateManyViewSortsTool extends BaseTool<
  typeof createManyViewSortsInputSchema
> {
  readonly inputSchema = createManyViewSortsInputSchema;

  constructor(
    private readonly viewSortService: ViewSortService,
    private readonly viewToolAccessService: ViewToolAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<
    typeof createManyViewSortsInputSchema
  >): Promise<ToolOutput> {
    await Promise.all(
      input.sorts.map(({ viewId }) =>
        this.viewToolAccessService.findViewEditableByUserOrThrow({
          viewId,
          workspaceId,
          userWorkspaceId,
          operation: 'update',
        }),
      ),
    );

    const results = [];

    for (const sortInput of input.sorts) {
      const sort = await this.viewSortService.createOne({
        createViewSortInput: {
          viewId: sortInput.viewId,
          fieldMetadataId: sortInput.fieldMetadataId,
          direction: sortInput.direction,
        },
        workspaceId,
      });

      results.push({
        id: sort.id,
        viewId: sort.viewId,
        fieldMetadataId: sort.fieldMetadataId,
        direction: sort.direction,
      });
    }

    return {
      success: true,
      message: `Created ${results.length} view sort(s)`,
      result: { created: results },
    };
  }
}
