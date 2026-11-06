import { type z } from 'zod';

import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolInputSchema } from 'src/engine/core-modules/tool-provider/types/tool-input-schema.type';

export const buildWorkflowToolExecutor = <TInputSchema extends ToolInputSchema>(
  tool: BaseTool<TInputSchema>,
  context: ToolProviderContext,
) => ({
  execute: (input: z.infer<TInputSchema>) => tool.execute({ input, context }),
});
