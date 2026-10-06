import { isPlainObject } from 'twenty-shared/utils';
import {
  type WorkflowStepWait,
  workflowStepWaitSchema,
} from 'twenty-shared/workflow';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import { WORKFLOW_AGENT_WAIT_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';

// The wait an execution paused on, when it ended on a wait tool call
export const findAgentStepWait = (
  steps: { toolResults: { toolName: string; output: unknown }[] }[],
): WorkflowStepWait | undefined => {
  const lastStepToolResults = steps[steps.length - 1]?.toolResults ?? [];

  for (const { toolName, output } of lastStepToolResults) {
    if (
      !WORKFLOW_AGENT_WAIT_TOOL_NAMES.includes(toolName) ||
      !isAwaitingPausingToolOutput(output) ||
      !isPlainObject(output) ||
      !isPlainObject(output.result)
    ) {
      continue;
    }

    const parsedWait = workflowStepWaitSchema.safeParse(output.result.wait);

    if (parsedWait.success) {
      return parsedWait.data;
    }
  }

  return undefined;
};
