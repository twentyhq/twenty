import { Test } from '@nestjs/testing';
import {
  WorkflowActionType,
  workflowActionSchema,
  getClassificationOutputSchema,
} from 'twenty-shared/workflow';
import { resolveInput } from 'twenty-shared/utils';

import { AiClassificationService } from 'src/engine/metadata-modules/ai/ai-classification/ai-classification.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { ClassifyWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/classify.workflow-action';
import { type WorkflowClassifyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

jest.mock(
  'src/engine/metadata-modules/ai/ai-classification/ai-classification.service',
  () => ({ AiClassificationService: class {} }),
);
jest.mock(
  'src/modules/workflow/workflow-executor/services/workflow-execution-context.service',
  () => ({ WorkflowExecutionContextService: class {} }),
);

const step: WorkflowClassifyAction = {
  id: 'f6432b11-0fa6-40f3-baa4-90f85d5d70a1',
  name: 'Classify request',
  type: WorkflowActionType.CLASSIFY,
  valid: true,
  settings: {
    input: {
      modelId: 'typesafe/jev-1.13.0',
      text: '{{trigger.body}}',
      instructions: 'Choose the responsible team',
      categories: [
        { label: 'billing', description: 'Payments' },
        { label: 'support', description: 'Bugs' },
      ],
    },
    outputSchema: getClassificationOutputSchema(),
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('ClassifyWorkflowAction', () => {
  let action: ClassifyWorkflowAction;
  const classify = jest.fn();

  beforeEach(async () => {
    classify.mockResolvedValue({ category: 'billing', probability: 0.95 });
    const module = await Test.createTestingModule({
      providers: [
        ClassifyWorkflowAction,
        { provide: AiClassificationService, useValue: { classify } },
        {
          provide: WorkflowExecutionContextService,
          useValue: {
            getExecutionContext: async () => ({
              authContext: { type: 'user', userWorkspaceId: 'member' },
            }),
          },
        },
      ],
    }).compile();
    action = module.get(ClassifyWorkflowAction);
  });

  it('accepts the shared action contract and exposes stable output fields before execution', () => {
    expect(workflowActionSchema.safeParse(step).success).toBe(true);
    expect(Object.keys(getClassificationOutputSchema())).toEqual([
      'category',
      'probability',
      'probabilities',
      'modelId',
      'resolvedModelId',
    ]);
    expect(
      workflowActionSchema.safeParse({
        ...step,
        settings: {
          ...step.settings,
          input: { ...step.settings.input, categories: [] },
        },
      }).success,
    ).toBe(false);
  });

  it('resolves workflow variables and attributes usage to the initiating member', async () => {
    const { result } = await action.execute({
      currentStepId: step.id,
      steps: [step],
      context: { trigger: { body: 'Please refund the duplicate charge.' } },
      runInfo: { workspaceId: 'workspace', workflowRunId: 'run' },
    });
    expect(classify).toHaveBeenCalledWith(
      { ...step.settings.input, text: 'Please refund the duplicate charge.' },
      'workspace',
      'member',
    );
    expect(resolveInput(`{{${step.id}.category}}`, { [step.id]: result })).toBe(
      'billing',
    );
    expect(
      resolveInput(`{{${step.id}.probability}}`, { [step.id]: result }),
    ).toBe(0.95);
  });

  it('leaves provider failures to the workflow error policy', async () => {
    classify.mockRejectedValue(new Error('Provider unavailable'));
    await expect(
      action.execute({
        currentStepId: step.id,
        steps: [step],
        context: {},
        runInfo: { workspaceId: 'workspace', workflowRunId: 'run' },
      }),
    ).rejects.toThrow('Provider unavailable');
  });
});
