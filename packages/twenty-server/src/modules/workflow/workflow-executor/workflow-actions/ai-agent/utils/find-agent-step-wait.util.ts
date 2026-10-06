import { isPlainObject } from 'twenty-shared/utils';
import {
  type WorkflowStepWait,
  workflowStepWaitSchema,
} from 'twenty-shared/workflow';

import { type AgentRunPausedToolResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-result.type';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import { WORKFLOW_AGENT_WAIT_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';

// The wait a run paused on, when it paused on a wait tool call
export const findAgentStepWait = (
  pausedToolResults: AgentRunPausedToolResult[],
): WorkflowStepWait | undefined => {
  for (const { toolName, output } of pausedToolResults) {
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
