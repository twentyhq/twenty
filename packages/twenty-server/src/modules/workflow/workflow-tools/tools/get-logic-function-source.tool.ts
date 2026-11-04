import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const getLogicFunctionSourceSchema = z.object({
  logicFunctionId: z
    .string()
    .uuid()
    .describe(
      'The ID of the logic function to read (from the code step settings.input.logicFunctionId)',
    ),
});

@DefineTool({
  name: 'get_logic_function_source',
  category: ToolCategory.WORKFLOW,
  description: `Read the current TypeScript source code of a logic function used in a workflow CODE step.

Use this to inspect the code that runs when a CODE step executes — for example, before editing an existing function with update_logic_function_source, so the edit is based on the real current source rather than a guess.

To find the logicFunctionId, look at the code step's settings.input.logicFunctionId field.`,
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class GetLogicFunctionSourceTool extends BaseTool<
  typeof getLogicFunctionSourceSchema
> {
  readonly inputSchema = getLogicFunctionSourceSchema;

  constructor(
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof getLogicFunctionSourceSchema
  >): Promise<ToolOutput> {
    try {
      const { logicFunctionId } = parameters;
      const { workspaceId } = context;

      const sourceHandlerCode =
        await this.logicFunctionFromSourceService.getSourceCode({
          id: logicFunctionId,
          workspaceId,
        });

      return {
        success: true,
        message: `Read the source code of logic function ${logicFunctionId}`,
        result: { logicFunctionId, sourceHandlerCode },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: message,
        message: `Failed to read logic function source: ${message}`,
      };
    }
  }
}
