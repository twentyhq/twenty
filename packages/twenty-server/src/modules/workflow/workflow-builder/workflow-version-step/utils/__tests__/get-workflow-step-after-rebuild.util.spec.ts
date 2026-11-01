import { type AgentResponseFormat } from 'twenty-shared/ai';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowStepAfterRebuild } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/get-workflow-step-after-rebuild.util';
import {
  type WorkflowAiAgentAction,
  type WorkflowDelayAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const DEFAULT_ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: 0 },
};

const RETRYING_ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: true },
  retryOnFailure: { value: 3 },
};

const JSON_RESPONSE_FORMAT: AgentResponseFormat = {
  type: 'json',
  schema: { type: 'object', properties: { score: { type: 'number' } } },
};

const buildAiAgentStep = ({
  name,
  input,
  errorHandlingOptions = DEFAULT_ERROR_HANDLING_OPTIONS,
}: {
  name: string;
  input: WorkflowAiAgentAction['settings']['input'];
  errorHandlingOptions?: WorkflowAiAgentAction['settings']['errorHandlingOptions'];
}): WorkflowAiAgentAction => ({
  id: 'step-id',
  name,
  type: WorkflowActionType.AI_AGENT,
  valid: false,
  settings: { input, outputSchema: {}, errorHandlingOptions },
});

const buildDelayStep = (
  errorHandlingOptions: WorkflowDelayAction['settings']['errorHandlingOptions'],
): WorkflowDelayAction => ({
  id: 'step-id',
  name: 'Delay',
  type: WorkflowActionType.DELAY,
  valid: false,
  settings: {
    input: { delayType: 'DURATION', duration: { minutes: 1 } },
    outputSchema: {},
    errorHandlingOptions,
  },
});

const builtGenerateStep = buildAiAgentStep({
  name: 'Generate',
  input: { instructions: '', prompt: '' },
});

const builtAgentStep = buildAiAgentStep({
  name: 'Lead qualifier',
  input: { agentId: 'agent-id', prompt: '' },
});

describe('getWorkflowStepAfterRebuild', () => {
  it.each([
    ['the Generate default', 'Generate'],
    ['the hidden agent default', 'Agent'],
    ['the label of the agent it ran', 'Lead qualifier'],
  ])('names an AI step named after %s for its new kind', (_, name) => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name,
          input: { agentId: 'previous-agent-id' },
        }),
        builtStep: builtGenerateStep,
        previousAgentLabel: 'Lead qualifier',
      }).name,
    ).toBe('Generate');
  });

  it('keeps a name the user typed', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: { agentId: 'previous-agent-id' },
        }),
        builtStep: builtGenerateStep,
        previousAgentLabel: 'Lead qualifier',
      }).name,
    ).toBe('Score the lead');
  });

  it.each([
    [
      'from an agent to Generate',
      { agentId: 'previous-agent-id' },
      builtGenerateStep,
    ],
    [
      'from Generate to an agent',
      { instructions: 'Qualify leads.' },
      builtAgentStep,
    ],
  ])(
    'keeps retries and continue on failure when an AI step switches %s',
    (_, input, builtStep) => {
      expect(
        getWorkflowStepAfterRebuild({
          existingStep: buildAiAgentStep({
            name: 'Score the lead',
            input,
            errorHandlingOptions: RETRYING_ERROR_HANDLING_OPTIONS,
          }),
          builtStep,
          previousAgentLabel: undefined,
        }).settings.errorHandlingOptions,
      ).toEqual(RETRYING_ERROR_HANDLING_OPTIONS);
    },
  );

  it('keeps the prompt and response format, and drops the Generate config, when Generate switches to an agent', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: {
            instructions: 'You qualify leads.',
            modelId: 'model-id',
            scope: {},
            prompt: 'Qualify {{trigger.name}}',
            responseFormat: JSON_RESPONSE_FORMAT,
          },
        }),
        builtStep: builtAgentStep,
        previousAgentLabel: undefined,
      }).settings.input,
    ).toEqual({
      agentId: 'agent-id',
      prompt: 'Qualify {{trigger.name}}',
      responseFormat: JSON_RESPONSE_FORMAT,
    });
  });

  it('keeps the conversation settings when an agent step switches to another agent', () => {
    const conversationInput = {
      workspaceMemberId: 'workspace-member-id',
      humanInputInstructions: 'Ask before emailing.',
      conversation: { scope: 'RUN' as const },
    };

    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: {
            agentId: 'previous-agent-id',
            prompt: 'Qualify',
            ...conversationInput,
          },
        }),
        builtStep: builtAgentStep,
        previousAgentLabel: undefined,
      }).settings.input,
    ).toEqual({ agentId: 'agent-id', prompt: 'Qualify', ...conversationInput });
  });

  it('drops the conversation settings when an agent step switches to Generate', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: {
            agentId: 'previous-agent-id',
            prompt: 'Qualify',
            workspaceMemberId: 'workspace-member-id',
            humanInputInstructions: 'Ask before emailing.',
          },
        }),
        builtStep: builtGenerateStep,
        previousAgentLabel: undefined,
      }).settings.input,
    ).toEqual({ instructions: '', prompt: 'Qualify' });
  });

  it('builds a step of another type rebuilt into an AI step afresh', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildDelayStep(RETRYING_ERROR_HANDLING_OPTIONS),
        builtStep: builtGenerateStep,
        previousAgentLabel: undefined,
      }),
    ).toEqual(builtGenerateStep);
  });

  it('builds an AI step rebuilt into another type afresh', () => {
    const builtDelayStep = buildDelayStep(DEFAULT_ERROR_HANDLING_OPTIONS);

    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: { agentId: 'previous-agent-id', prompt: 'Qualify' },
          errorHandlingOptions: RETRYING_ERROR_HANDLING_OPTIONS,
        }),
        builtStep: builtDelayStep,
        previousAgentLabel: 'Lead qualifier',
      }),
    ).toEqual(builtDelayStep);
  });
});
