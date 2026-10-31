import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowStepNameAfterRebuild } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/get-workflow-step-name-after-rebuild.util';

const builtStep = { name: 'Generate', type: WorkflowActionType.AI_AGENT };

describe('getWorkflowStepNameAfterRebuild', () => {
  it.each([
    ['the Generate default', 'Generate'],
    ['the hidden agent default', 'Agent'],
    ['the label of the agent it ran', 'Lead qualifier'],
  ])('names an AI step named after %s for its new kind', (_, name) => {
    expect(
      getWorkflowStepNameAfterRebuild({
        existingStep: { name, type: WorkflowActionType.AI_AGENT },
        builtStep,
        previousAgentLabel: 'Lead qualifier',
      }),
    ).toBe('Generate');
  });

  it('keeps a name the user typed', () => {
    expect(
      getWorkflowStepNameAfterRebuild({
        existingStep: {
          name: 'Score the lead',
          type: WorkflowActionType.AI_AGENT,
        },
        builtStep,
        previousAgentLabel: 'Lead qualifier',
      }),
    ).toBe('Score the lead');
  });

  it('names a step of another type after its new type', () => {
    expect(
      getWorkflowStepNameAfterRebuild({
        existingStep: { name: 'Score the lead', type: WorkflowActionType.CODE },
        builtStep,
        previousAgentLabel: undefined,
      }),
    ).toBe('Generate');
  });

  it('names an AI step rebuilt into another type after its new type', () => {
    expect(
      getWorkflowStepNameAfterRebuild({
        existingStep: {
          name: 'Score the lead',
          type: WorkflowActionType.AI_AGENT,
        },
        builtStep: { name: 'Delay', type: WorkflowActionType.DELAY },
        previousAgentLabel: 'Lead qualifier',
      }),
    ).toBe('Delay');
  });
});
