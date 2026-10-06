import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { stampPendingToolPartsWithWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/utils/stamp-pending-tool-parts-with-workflow-step.util';

const WORKFLOW_STEP = { workflowRunId: 'run-id', stepId: 'step-id' };

const toolPart = (status: string) =>
  ({
    type: 'tool-ask_question',
    toolCallId: `call-${status}`,
    state: 'output-available',
    input: {},
    output: { result: { status } },
  }) as unknown as ExtendedUIMessagePart;

describe('stampPendingToolPartsWithWorkflowStep', () => {
  it('names the waiting step on pending calls only', () => {
    const textPart = { type: 'text', text: 'Hello' } as ExtendedUIMessagePart;

    expect(
      stampPendingToolPartsWithWorkflowStep({
        parts: [textPart, toolPart('pending'), toolPart('answered')],
        workflowStep: WORKFLOW_STEP,
      }),
    ).toEqual([
      textPart,
      {
        ...toolPart('pending'),
        output: { result: { status: 'pending' }, workflowStep: WORKFLOW_STEP },
      },
      toolPart('answered'),
    ]);
  });
});
