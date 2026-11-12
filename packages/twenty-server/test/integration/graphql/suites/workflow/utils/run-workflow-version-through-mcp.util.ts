import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type RunWorkflowVersionToolOutput = ToolOutput & {
  workflowRunId?: string;
};

export const runWorkflowVersionThroughMcp = async ({
  coreWorkflowVersionId,
  payload,
  token,
}: {
  coreWorkflowVersionId: string;
  payload?: object;
  token: string;
}): Promise<RunWorkflowVersionToolOutput> =>
  executeToolThroughMcp({
    toolName: 'run_workflow_version',
    toolArguments: { coreWorkflowVersionId, payload },
    token,
  });
