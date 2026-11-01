import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowStepAfterRebuild } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/get-workflow-step-after-rebuild.util';
import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const DEFAULT_ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: 0 },
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

const builtGenerateStep = buildAiAgentStep({
  name: 'Generate',
  input: { instructions: '', prompt: '' },
});

const builtDelayStep = {
  id: 'step-id',
  name: 'Delay',
  type: WorkflowActionType.DELAY,
  valid: false,
  settings: {
    input: { delayType: 'DURATION', duration: { minutes: 1 } },
    outputSchema: {},
    errorHandlingOptions: DEFAULT_ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

const retryingErrorHandlingOptions = {
  continueOnFailure: { value: true },
  retryOnFailure: { value: 3 },
};

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
          input: { agentId: 'agent-id' },
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
          input: { agentId: 'agent-id' },
        }),
        builtStep: builtGenerateStep,
        previousAgentLabel: 'Lead qualifier',
      }).name,
    ).toBe('Score the lead');
  });

  it.each([
    ['from an agent to Generate', { agentId: 'agent-id' }, builtGenerateStep],
    [
      'from Generate to an agent',
      { instructions: 'Qualify leads.' },
      buildAiAgentStep({
        name: 'Lead qualifier',
        input: { agentId: 'agent-id', prompt: '' },
      }),
    ],
  ])(
    'keeps retries and continue on failure when an AI step switches %s',
    (_, input, builtStep) => {
      expect(
        getWorkflowStepAfterRebuild({
          existingStep: buildAiAgentStep({
            name: 'Score the lead',
            input,
            errorHandlingOptions: retryingErrorHandlingOptions,
          }),
          builtStep,
          previousAgentLabel: undefined,
        }).settings.errorHandlingOptions,
      ).toEqual(retryingErrorHandlingOptions);
    },
  );

  it('builds a step of another type rebuilt into an AI step afresh', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: {
          ...builtDelayStep,
          name: 'Score the lead',
          settings: {
            ...builtDelayStep.settings,
            errorHandlingOptions: retryingErrorHandlingOptions,
          },
        } as WorkflowAction,
        builtStep: builtGenerateStep,
        previousAgentLabel: undefined,
      }),
    ).toEqual(builtGenerateStep);
  });

  it('builds an AI step rebuilt into another type afresh', () => {
    expect(
      getWorkflowStepAfterRebuild({
        existingStep: buildAiAgentStep({
          name: 'Score the lead',
          input: { agentId: 'agent-id' },
          errorHandlingOptions: retryingErrorHandlingOptions,
        }),
        builtStep: builtDelayStep,
        previousAgentLabel: 'Lead qualifier',
      }),
    ).toEqual(builtDelayStep);
  });
});
