import { type WorkflowMcpToolActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/types/workflow-mcp-tool-action-input.type';
import {
  type BaseWorkflowActionSettings,
  type WithExpectedOutputSchema,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowMcpToolActionSettings = BaseWorkflowActionSettings &
  WithExpectedOutputSchema & {
    input: WorkflowMcpToolActionInput;
  };
