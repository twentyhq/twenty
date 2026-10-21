import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';

const getViewQueryParamsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe('ID of the view to get query parameters for.'),
});

@DefineTool({
  name: 'get_view_query_parameters',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [],
  description:
    'Get filter and sort parameters from a view. Use these parameters with find_* tools to query records matching the view.',
})
export class GetViewQueryParametersTool extends BaseTool<
  typeof getViewQueryParamsInputSchema
> {
  readonly inputSchema = getViewQueryParamsInputSchema;

  constructor(private readonly viewQueryParamsService: ViewQueryParamsService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId, actorContext },
  }: ToolExecuteArgs<
    typeof getViewQueryParamsInputSchema
  >): Promise<ToolOutput> {
    const currentWorkspaceMemberId =
      actorContext?.workspaceMemberId ?? undefined;

    const queryParameters =
      await this.viewQueryParamsService.resolveViewToQueryParams({
        viewId: input.viewId,
        workspaceId,
        currentWorkspaceMemberId,
        currentUserWorkspaceId: userWorkspaceId,
      });

    return {
      success: true,
      message: `Query parameters resolved for view ${input.viewId}`,
      result: queryParameters,
    };
  }
}
