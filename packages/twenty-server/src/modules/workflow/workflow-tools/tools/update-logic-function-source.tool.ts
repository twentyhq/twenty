import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

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

export const createUpdateLogicFunctionSourceTool = (
  deps: Pick<WorkflowToolDependencies, 'logicFunctionFromSourceService'>,
  context: WorkflowToolContext,
) => ({
  name: 'update_logic_function_source' as const,
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

To find the logicFunctionId, look at the code step's settings.input.logicFunctionId field.`,
  inputSchema: updateLogicFunctionSourceSchema,
  execute: async (parameters: { logicFunctionId: string; code: string }) => {
    try {
      const { logicFunctionId, code } = parameters;
      const { workspaceId } = context;

      await deps.logicFunctionFromSourceService.updateOneFromSource({
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
        logicFunctionId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update logic function source: ${error.message}`,
      };
    }
  },
});
