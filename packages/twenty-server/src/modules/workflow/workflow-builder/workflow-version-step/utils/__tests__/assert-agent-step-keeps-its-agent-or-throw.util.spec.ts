import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertAgentStepKeepsItsAgentOrThrow } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/assert-agent-step-keeps-its-agent-or-throw.util';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildAgentStep = (agentId?: string): WorkflowAiAgentAction => ({
  id: 'step-id',
  name: 'Draft the quote',
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  settings: {
    input: { agentId, prompt: 'Draft the quote' },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

describe('assertAgentStepKeepsItsAgentOrThrow', () => {
  it('refuses an update that drops the agent of an agent step', () => {
    expect(() =>
      assertAgentStepKeepsItsAgentOrThrow({
        existingStep: buildAgentStep('agent-id'),
        step: buildAgentStep(),
      }),
    ).toThrow('Agent step "Draft the quote" must keep its agent');
  });

  it('accepts an update that keeps the agent', () => {
    expect(() =>
      assertAgentStepKeepsItsAgentOrThrow({
        existingStep: buildAgentStep('agent-id'),
        step: buildAgentStep('agent-id'),
      }),
    ).not.toThrow();
  });

  it('keeps a step saved without an agent editable', () => {
    expect(() =>
      assertAgentStepKeepsItsAgentOrThrow({
        existingStep: buildAgentStep(''),
        step: buildAgentStep(),
      }),
    ).not.toThrow();
  });
});
