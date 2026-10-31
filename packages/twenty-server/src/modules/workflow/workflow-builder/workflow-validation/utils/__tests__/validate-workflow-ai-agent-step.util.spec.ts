import { WorkflowActionType } from 'twenty-shared/workflow';

import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { type WorkflowAiAgentActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-input.type';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const errorCodesFor = (input: WorkflowAiAgentActionInput) => {
  const step = {
    id: 'step-1',
    name: 'Qualify',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input,
    },
  } as WorkflowAiAgentAction;

  return validateWorkflowAiAgentStep(step)
    .filter(({ severity }) => severity === 'error')
    .map(({ code }) => code);
};

describe('validateWorkflowAiAgentStep', () => {
  it('accepts a step running an agent', () => {
    expect(errorCodesFor({ agentId: 'agent-id' })).toEqual([]);
  });

  it('accepts a step with its own instructions and a prompt', () => {
    expect(
      errorCodesFor({
        instructions: 'Qualify the lead.',
        prompt: 'Qualify {{trigger.name}}',
      }),
    ).toEqual([]);
  });

  it('refuses a step without an agent or a prompt', () => {
    expect(
      errorCodesFor({ instructions: 'Qualify the lead.', prompt: '  ' }),
    ).toEqual(['AI_AGENT_MISSING_PROMPT']);
  });

  it('refuses a step running an agent with its own config', () => {
    expect(errorCodesFor({ agentId: 'agent-id', modelId: 'model-id' })).toEqual(
      ['AI_AGENT_CONFLICTING_CONFIG'],
    );
  });

  it('refuses a step without an agent that asks humans for input', () => {
    expect(
      errorCodesFor({
        prompt: 'Qualify {{trigger.name}}',
        humanInputInstructions: 'Ask before choosing a plan.',
      }),
    ).toEqual(['AI_AGENT_CONFLICTING_CONFIG']);
  });

  it('refuses a step without an agent that keeps a conversation', () => {
    expect(
      errorCodesFor({
        prompt: 'Qualify {{trigger.name}}',
        conversation: { scope: 'RUN' },
      }),
    ).toEqual(['AI_AGENT_CONFLICTING_CONFIG']);
  });

  it('ignores blank human input instructions on a step without an agent', () => {
    expect(
      errorCodesFor({
        prompt: 'Qualify {{trigger.name}}',
        humanInputInstructions: '  ',
      }),
    ).toEqual([]);
  });

  it('accepts human input instructions and a conversation on a step running an agent', () => {
    expect(
      errorCodesFor({
        agentId: 'agent-id',
        humanInputInstructions: 'Ask before choosing a plan.',
        conversation: { scope: 'KEY', key: 'lead' },
      }),
    ).toEqual([]);
  });
});
