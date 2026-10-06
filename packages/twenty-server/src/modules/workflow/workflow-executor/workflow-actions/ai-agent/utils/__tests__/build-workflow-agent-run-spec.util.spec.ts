import { WorkflowActionType } from 'twenty-shared/workflow';

import { buildWorkflowAgentRunSpec } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-spec.util';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (
  input: WorkflowAiAgentAction['settings']['input'],
): WorkflowAiAgentAction =>
  ({
    id: 'step-id',
    name: 'Draft the quote',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    nextStepIds: [],
    settings: {
      input,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  }) as WorkflowAiAgentAction;

describe('buildWorkflowAgentRunSpec', () => {
  it('lets the agent wait but not ask without human input instructions', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        prompt: 'Draft the quote',
        humanInputInstructions: '  ',
      }),
      isApplicationBound: false,
    });

    expect(spec).toMatchObject({
      agentId: null,
      title: 'Draft the quote',
      instructions: null,
      capabilities: {
        canAskHumans: false,
        canProposeToolCalls: false,
        canWait: true,
      },
    });
    expect(spec).not.toHaveProperty('additionalExcludedToolNames');
  });

  it('lets the agent ask humans with the instructions the step gives', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        agentId: 'agent-id',
        humanInputInstructions: ' Ask before choosing a plan. ',
      }),
      isApplicationBound: false,
    });

    expect(spec.agentId).toBe('agent-id');
    expect(spec.capabilities).toEqual({
      canAskHumans: true,
      canProposeToolCalls: true,
      canWait: true,
    });
    expect(spec.instructions).toMatch(/Ask before choosing a plan\.$/);
  });

  it('keeps tools out of reach of an application-bound run', () => {
    expect(
      buildWorkflowAgentRunSpec({
        step: buildStep({ prompt: 'Draft the quote' }),
        isApplicationBound: true,
      }).additionalExcludedToolNames,
    ).toContain('send_email');
  });
});
