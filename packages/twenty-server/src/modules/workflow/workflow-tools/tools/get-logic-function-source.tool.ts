import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const getLogicFunctionSourceSchema = z.object({
  logicFunctionId: z
    .string()
    .uuid()
    .describe(
      'The ID of the logic function to read (from the code step settings.input.logicFunctionId)',
    ),
});

export const createGetLogicFunctionSourceTool = (
  deps: Pick<WorkflowToolDependencies, 'logicFunctionFromSourceService'>,
  context: WorkflowToolContext,
) => ({
  name: 'get_logic_function_source' as const,
  description: `Read the current TypeScript source code of a logic function used in a workflow CODE step.

Use this to inspect the code that runs when a CODE step executes — for example, before editing an existing function with update_logic_function_source, so the edit is based on the real current source rather than a guess.

To find the logicFunctionId, look at the code step's settings.input.logicFunctionId field.`,
  inputSchema: getLogicFunctionSourceSchema,
  execute: async (parameters: { logicFunctionId: string }) => {
    try {
      const { logicFunctionId } = parameters;
      const { workspaceId } = context;

      const sourceHandlerCode =
        await deps.logicFunctionFromSourceService.getSourceCode({
          id: logicFunctionId,
          workspaceId,
        });

      return {
        success: true,
        logicFunctionId,
        sourceHandlerCode,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: message,
        message: `Failed to read logic function source: ${message}`,
      };
    }
  },
});
