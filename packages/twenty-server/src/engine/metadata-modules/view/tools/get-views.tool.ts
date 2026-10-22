import { isNonEmptyString } from '@sniptt/guards';
import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolIdentifierService } from 'src/engine/metadata-modules/view/tools/services/view-tool-identifier.service';

const getViewsInputSchema = z.object({
  objectNameSingular: z
    .string()
    .optional()
    .describe(
      'Filter views by object name (e.g., "task", "person", "company"). If omitted, returns all views.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum views to return.'),
});

@DefineTool({
  name: 'get_views',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [],
  description:
    'List views in the workspace. Views define how records are displayed, filtered, and sorted.',
})
export class GetViewsTool extends BaseTool<typeof getViewsInputSchema> {
  readonly inputSchema = getViewsInputSchema;

  constructor(
    private readonly viewService: ViewService,
    private readonly viewToolIdentifierService: ViewToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof getViewsInputSchema>): Promise<ToolOutput> {
    const views = isNonEmptyString(input.objectNameSingular)
      ? await this.viewService.findByObjectMetadataId(
          workspaceId,
          await this.viewToolIdentifierService.resolveObjectMetadataIdOrThrow({
            workspaceId,
            objectNameSingular: input.objectNameSingular,
          }),
          userWorkspaceId,
        )
      : await this.viewService.findByWorkspaceId(workspaceId, userWorkspaceId);

    const limitedViews = views.slice(0, input.limit);

    return {
      success: true,
      message: `Found ${limitedViews.length} view(s)`,
      result: {
        views: limitedViews.map((view) => ({
          id: view.id,
          name: view.name,
          objectMetadataId: view.objectMetadataId,
          type: view.type,
          icon: view.icon,
          visibility: view.visibility,
          position: view.position,
        })),
      },
    };
  }
}
