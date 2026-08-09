import { workflowRunStepLogSchema } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowCreateInboxItemActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/types/workflow-create-inbox-item-action-input.type';
import { buildCreateInboxItemStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/utils/build-create-inbox-item-step-log.util';

const input: WorkflowCreateInboxItemActionInput = {
  title: 'Approve the discount',
  typeKey: 'approval',
};

describe('buildCreateInboxItemStepLog', () => {
  it('builds a success log from the tool result', () => {
    // Prepare
    const output: ToolOutput = {
      success: true,
      message: 'Inbox item "Approve the discount" created',
      result: {
        inboxItemId: 'inbox-item-id',
        title: 'Approve the discount',
        queueId: 'queue-id',
      },
    };

    // Act
    const log = buildCreateInboxItemStepLog({ input, output, durationMs: 12 });

    // Assert
    expect(log.details).toMatchObject({
      type: 'CREATE_INBOX_ITEM',
      status: 'SUCCESS',
      inboxItemId: 'inbox-item-id',
      title: 'Approve the discount',
      queueId: 'queue-id',
      durationMs: 12,
    });
    expect(workflowRunStepLogSchema.safeParse(log).success).toBe(true);
  });

  // The step still has to log what it tried, so the title falls back to the input
  it('builds an error log that keeps the title the step asked for', () => {
    // Prepare
    const output: ToolOutput = {
      success: false,
      message: 'Failed to create inbox item',
      error: 'The inbox is not enabled for this workspace',
    };

    // Act
    const log = buildCreateInboxItemStepLog({ input, output, durationMs: 3 });

    // Assert
    expect(log.details).toMatchObject({
      type: 'CREATE_INBOX_ITEM',
      status: 'ERROR',
      title: 'Approve the discount',
      error: 'The inbox is not enabled for this workspace',
    });
    expect(workflowRunStepLogSchema.safeParse(log).success).toBe(true);
  });
});
