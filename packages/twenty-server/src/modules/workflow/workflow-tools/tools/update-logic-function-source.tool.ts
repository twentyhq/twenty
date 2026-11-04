import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const updateLogicFunctionSourceSchema = z.object({
  logicFunctionId: z
    .string()
    .uuid()
    .describe(
      'The ID of the logic function to update (from the code step settings.input.logicFunctionId)',
    ),
  code: z
    .string()
    .describe(
      'The TypeScript source code for the logic function. Must export a main function.',
    ),
});

@DefineTool({
  name: 'update_logic_function_source',
  category: ToolCategory.WORKFLOW,
  description: `Update the TypeScript source code of a logic function used in a workflow code step.

Use this tool to modify the actual code that runs when a CODE step executes.

The code must:
- Export a 'main' function as the entry point
- Use TypeScript syntax
- Return an object with the result
- Use native APIs only (fetch, etc.) - external packages cannot be imported

Example code using fetch for HTTP requests:
\`\`\`typescript
export const main = async (params: { url: string }) => {
  const response = await fetch(params.url);
  const data = await response.json();
  return { data };
};
\`\`\`

To find the logicFunctionId, look at the code step's settings.input.logicFunctionId field.

Only code steps of a DRAFT workflow version can be edited. For an active or past version, call create_draft_from_workflow_version first, then use the logicFunctionId of the same step in the new draft: the draft copies each code step onto a new logic function.`,
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class UpdateLogicFunctionSourceTool extends BaseTool<
  typeof updateLogicFunctionSourceSchema
> {
  readonly inputSchema = updateLogicFunctionSourceSchema;

  constructor(
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof updateLogicFunctionSourceSchema
  >): Promise<ToolOutput> {
    try {
      const { logicFunctionId, code } = parameters;
      const { workspaceId } = context;

      await this.logicFunctionFromSourceService.updateOneFromSource({
        updateLogicFunctionFromSourceInput: {
          id: logicFunctionId,
          update: {
            sourceHandlerCode: code,
          },
        },
        workspaceId,
      });

      return {
        success: true,
        message: `Successfully updated source code for logic function ${logicFunctionId}`,
        result: { logicFunctionId },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update logic function source: ${error.message}`,
      };
    }
  }
}
