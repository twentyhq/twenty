import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowCreateInboxItemActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/types/workflow-create-inbox-item-action-input.type';

export const buildCreateInboxItemStepLog = ({
  input,
  output,
  durationMs,
}: {
  input: WorkflowCreateInboxItemActionInput;
  output: ToolOutput;
  durationMs: number;
}): WorkflowRunStepLog => {
  const result = (output.result ?? {}) as Record<string, unknown>;

  const extractString = (key: string): string | undefined =>
    typeof result[key] === 'string' ? result[key] : undefined;

  return {
    details: {
      type: 'CREATE_INBOX_ITEM',
      status: output.success ? 'SUCCESS' : 'ERROR',
      title: extractString('title') ?? input.title,
      inboxItemId: extractString('inboxItemId'),
      queueId: extractString('queueId'),
      assigneeUserWorkspaceId: extractString('assigneeUserWorkspaceId'),
      error: output.error,
      durationMs,
    },
    entries: [],
    sizeBytes: 0,
  };
};
