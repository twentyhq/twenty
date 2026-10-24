import { WorkflowActionType } from 'twenty-shared/workflow';

import { keepExistingStepResourceIds } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/keep-existing-step-resource-ids';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: 0 },
  continueOnFailure: { value: false },
};

const buildCodeStep = ({
  name,
  logicFunctionId,
}: {
  name: string;
  logicFunctionId: string;
}): WorkflowAction => ({
  id: 'step-id',
  name,
  type: WorkflowActionType.CODE,
  valid: true,
  settings: {
    input: { logicFunctionId, logicFunctionInput: {} },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildAiAgentStep = ({
  name,
  agentId,
}: {
  name: string;
  agentId: string;
}): WorkflowAction => ({
  id: 'step-id',
  name,
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  settings: {
    input: { agentId, prompt: '' },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

describe('keepExistingStepResourceIds', () => {
  it('keeps the logic function of a code step', () => {
    expect(
      keepExistingStepResourceIds({
        existingStep: buildCodeStep({
          name: 'Existing',
          logicFunctionId: 'draft-logic-function-id',
        }),
        step: buildCodeStep({
          name: 'Updated',
          logicFunctionId: 'active-logic-function-id',
        }),
      }),
    ).toEqual(
      buildCodeStep({
        name: 'Updated',
        logicFunctionId: 'draft-logic-function-id',
      }),
    );
  });

  it('keeps the agent of an AI agent step', () => {
    expect(
      keepExistingStepResourceIds({
        existingStep: buildAiAgentStep({
          name: 'Existing',
          agentId: 'draft-agent-id',
        }),
        step: buildAiAgentStep({
          name: 'Updated',
          agentId: 'active-agent-id',
        }),
      }),
    ).toEqual(buildAiAgentStep({ name: 'Updated', agentId: 'draft-agent-id' }));
  });

  it('returns other steps unchanged', () => {
    const step = buildCodeStep({
      name: 'Updated',
      logicFunctionId: 'logic-function-id',
    });

    expect(
      keepExistingStepResourceIds({
        existingStep: buildAiAgentStep({ name: 'Existing', agentId: 'a' }),
        step,
      }),
    ).toBe(step);
  });
});
