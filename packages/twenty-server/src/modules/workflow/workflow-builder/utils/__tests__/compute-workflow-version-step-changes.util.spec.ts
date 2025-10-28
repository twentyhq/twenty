import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

describe('computeWorkflowVersionStepChanges', () => {
  const mockTrigger: WorkflowTrigger = {
    name: 'Test Manual Trigger',
    type: WorkflowTriggerType.MANUAL,
    settings: {
      outputSchema: {},
    },
    nextStepIds: ['step-1'],
  };

  const mockSteps: WorkflowAction[] = [
    {
      id: 'step-1',
      name: 'Form Step',
      type: WorkflowActionType.FORM,
      settings: {
        input: [],
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      valid: true,
      nextStepIds: ['step-2'],
    },
    {
      id: 'step-2',
      name: 'Email Step',
      type: WorkflowActionType.SEND_EMAIL,
      settings: {
        input: {
          connectedAccountId: '',
          email: '',
          subject: '',
          body: '',
        },
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      valid: true,
      nextStepIds: [],
    },
  ];

  it('should compute trigger diff when trigger is updated', () => {
    const existingTrigger = mockTrigger;
    const updatedTrigger = {
      ...mockTrigger,
      nextStepIds: ['step-1', 'step-3'],
    };

    const result = computeWorkflowVersionStepChanges({
      existingTrigger,
      existingSteps: mockSteps,
      updatedTrigger,
      updatedSteps: mockSteps,
    });

    expect(result.triggerDiff).toMatchObject([
      { path: ['trigger', 'nextStepIds', 1], type: 'CREATE', value: 'step-3' },
    ]);
    expect(result.stepsDiff).toMatchObject([]);
    expect(result.stepsDiff.length).toBe(0); // No steps changed

    // Verify the trigger diff contains the nextStepIds change
    const nextStepIdsDiff = result.triggerDiff.find((diff) =>
      diff.path.includes('nextStepIds'),
    );

    expect(nextStepIdsDiff).toMatchObject({
      type: 'CREATE',
      path: ['trigger', 'nextStepIds', 1],
      value: 'step-3',
    });
  });

  it('should compute steps diff when steps are updated', () => {
    const existingSteps = mockSteps;
    const updatedSteps = [
      ...mockSteps,
      {
        id: 'step-3',
        name: 'Code Step',
        type: WorkflowActionType.CODE,
        settings: {
          input: {
            serverlessFunctionId: '',
            serverlessFunctionVersion: '',
            serverlessFunctionInput: {},
          },
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        valid: true,
        nextStepIds: [],
      } as WorkflowAction,
    ];

    const result = computeWorkflowVersionStepChanges({
      existingTrigger: mockTrigger,
      existingSteps,
      updatedTrigger: mockTrigger,
      updatedSteps,
    });

    expect(result.stepsDiff).toBeDefined();
    expect(result.stepsDiff.length).toBeGreaterThan(0);
    expect(result.triggerDiff).toBeDefined();
    expect(result.triggerDiff.length).toBe(0); // No trigger changed

    // Verify the steps diff contains the new step
    const createDiff = result.stepsDiff.find((diff) => diff.type === 'CREATE');

    expect(createDiff).toBeDefined();
  });

  it('should return empty diffs when no changes are made', () => {
    const result = computeWorkflowVersionStepChanges({
      existingTrigger: mockTrigger,
      existingSteps: mockSteps,
      updatedTrigger: mockTrigger,
      updatedSteps: mockSteps,
    });

    expect(result.triggerDiff).toBeDefined();
    expect(result.triggerDiff.length).toBe(0);
    expect(result.stepsDiff).toBeDefined();
    expect(result.stepsDiff.length).toBe(0);
  });

  it('should handle null existing trigger and steps', () => {
    const updatedTrigger = mockTrigger;
    const updatedSteps = mockSteps;

    const result = computeWorkflowVersionStepChanges({
      existingTrigger: null,
      existingSteps: null,
      updatedTrigger,
      updatedSteps,
    });

    expect(result.triggerDiff).toBeDefined();
    expect(result.triggerDiff.length).toBeGreaterThan(0);
    expect(result.stepsDiff).toBeDefined();
    expect(result.stepsDiff.length).toBeGreaterThan(0);

    // Verify change diffs are present
    const triggerChangeDiff = result.triggerDiff.find(
      (diff) => diff.type === 'CHANGE',
    );

    expect(triggerChangeDiff).toBeDefined();

    const stepsChangeDiff = result.stepsDiff.find(
      (diff) => diff.type === 'CHANGE',
    );

    expect(stepsChangeDiff).toBeDefined();
  });

  it('should return empty diffs when updated values are undefined', () => {
    const result = computeWorkflowVersionStepChanges({
      existingTrigger: mockTrigger,
      existingSteps: mockSteps,
      // updatedTrigger and updatedSteps are undefined
    });

    expect(result.triggerDiff).toBeDefined();
    expect(result.triggerDiff.length).toBe(0);
    expect(result.stepsDiff).toBeDefined();
    expect(result.stepsDiff.length).toBe(0);
  });
});
