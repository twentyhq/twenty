import { type ToolSet } from 'ai';

import {
  WAIT_FOR_DURATION_TOOL_NAME,
  WAIT_FOR_EVENT_TOOL_NAME,
} from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';
import { createWaitForDurationTool } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/create-wait-for-duration.tool';
import { createWaitForEventTool } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/create-wait-for-event.tool';
import { type WorkflowAgentWaitSlot } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/workflow-agent-wait-slot.type';

// a step resumes on one wait, so a second wait call of the same execution is refused instead of left pending
export const createWorkflowAgentWaitTools = (): ToolSet => {
  const waitSlot: WorkflowAgentWaitSlot = { isTaken: false };

  return {
    [WAIT_FOR_EVENT_TOOL_NAME]: createWaitForEventTool(waitSlot),
    [WAIT_FOR_DURATION_TOOL_NAME]: createWaitForDurationTool(waitSlot),
  };
};
