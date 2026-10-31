import { WorkflowActionType } from 'twenty-shared/workflow';

import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const codesFor = (input: WorkflowAiAgentAction['settings']['input']) =>
  validateWorkflowAiAgentStep({
    id: 'step-1',
    name: 'Qualify',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    settings: {
      outputSchema: { response: {} },
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input,
    },
  } as WorkflowAiAgentAction).map(({ code }) => code);

describe('validateWorkflowAiAgentStep', () => {
  it('accepts a step running an agent', () => {
    expect(codesFor({ agentId: 'agent-id' })).toEqual([]);
  });

  it('accepts a step with its own instructions and no agent', () => {
    expect(codesFor({ instructions: 'Qualify the lead.' })).toEqual([]);
  });

  it('accepts a step with only a prompt', () => {
    expect(codesFor({ prompt: 'Qualify {{trigger.name}}' })).toEqual([]);
  });

  it('refuses a step with no agent, instructions or prompt', () => {
    expect(codesFor({ instructions: '  ' })).toEqual([
      'AI_AGENT_MISSING_INSTRUCTIONS',
    ]);
  });

  it('refuses a step running an agent with its own config', () => {
    expect(codesFor({ agentId: 'agent-id', modelId: 'model-id' })).toEqual([
      'AI_AGENT_CONFLICTING_CONFIG',
    ]);
  });
});
