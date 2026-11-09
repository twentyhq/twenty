import { ToolCategory } from 'twenty-shared/ai';
import { ViewSortDirection } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { VIEW_SORT_ACCESS_POLICY } from 'src/engine/metadata-modules/view-sort/constants/view-sort-access-policy.constant';

const updateViewSortInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view sort to update'),
  direction: z
    .enum(ViewSortDirection)
    .optional()
    .describe('New sort direction: ASC or DESC'),
});

@DefineTool({
  name: 'update_view_sort',
  category: ToolCategory.VIEW,
  accessPolicy: VIEW_SORT_ACCESS_POLICY,
  description:
    'Update a sort on a view. Use get_view_sorts to find the sort ID.',
})
export class UpdateViewSortTool extends BaseTool<
  typeof updateViewSortInputSchema
> {
  readonly inputSchema = updateViewSortInputSchema;

  constructor(
    private readonly viewSortService: ViewSortService,
    private readonly viewAccessService: ViewAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId, authContext },
  }: ToolExecuteArgs<typeof updateViewSortInputSchema>): Promise<ToolOutput> {
    await this.viewAccessService.findModifiableParentViewOrThrow({
      kind: 'viewSort',
      entityId: input.id,
      accessContext: { workspaceId, userWorkspaceId, authContext },
    });

    const sort = await this.viewSortService.updateOne({
      updateViewSortInput: {
        id: input.id,
        update: {
          direction: input.direction,
        },
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View sort ${sort.id} updated`,
      result: {
        id: sort.id,
        viewId: sort.viewId,
        fieldMetadataId: sort.fieldMetadataId,
        direction: sort.direction,
      },
    };
  }
}
