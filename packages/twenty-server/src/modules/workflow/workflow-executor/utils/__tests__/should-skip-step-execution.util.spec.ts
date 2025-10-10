import { StepStatus } from 'twenty-shared/workflow';

import { shouldSkipStepExecution } from 'src/modules/workflow/workflow-executor/utils/should-skip-step-execution.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('shouldSkipStepExecution', () => {
  const createMockStep = (
    id: string,
    nextStepIds: string[] = [],
  ): WorkflowAction => ({
    id,
    name: 'Mock Step',
    type: WorkflowActionType.CODE,
    settings: {
      input: {
        serverlessFunctionId: 'mock-function-id',
        serverlessFunctionVersion: 'mock-function-version',
        serverlessFunctionInput: {},
      },
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      outputSchema: {},
    },
    valid: true,
    nextStepIds,
  });

  it('should return true when all parent steps are skipped', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.SKIPPED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return true when all parent steps are stopped', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.STOPPED },
      'step-2': { status: StepStatus.STOPPED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return true when parent steps are mix of skipped and stopped', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.STOPPED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return false when at least one parent step is successful', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.SUCCESS },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when at least one parent step is failed', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.FAILED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when at least one parent step is running', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.RUNNING },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when at least one parent step is not started', () => {
    const steps = [
      createMockStep('step-1', ['step-3']),
      createMockStep('step-2', ['step-3']),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.NOT_STARTED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when there are no parent steps', () => {
    const steps = [
      createMockStep('step-1', ['step-2']),
      createMockStep('step-2', []),
      createMockStep('step-3', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.SKIPPED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return true when single parent step is skipped', () => {
    const steps = [
      createMockStep('step-1', ['step-2']),
      createMockStep('step-2', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[1],
      steps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should handle undefined steps gracefully', () => {
    const steps = [
      createMockStep('step-1', ['step-2']),
      undefined as unknown as WorkflowAction,
      createMockStep('step-2', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[2],
      steps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return false when parent step status is pending', () => {
    const steps = [
      createMockStep('step-1', ['step-2']),
      createMockStep('step-2', []),
    ];
    const stepInfos = {
      'step-1': { status: StepStatus.PENDING },
      'step-2': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldSkipStepExecution({
      step: steps[1],
      steps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should work with multiple parent steps with different statuses', () => {
    const steps = [
      createMockStep('step-1', ['step-4']),
      createMockStep('step-2', ['step-4']),
      createMockStep('step-3', ['step-4']),
      createMockStep('step-4', []),
    ];

    // Test case 1: All skipped - should return true
    expect(
      shouldSkipStepExecution({
        step: steps[3],
        steps,
        stepInfos: {
          'step-1': { status: StepStatus.SKIPPED },
          'step-2': { status: StepStatus.SKIPPED },
          'step-3': { status: StepStatus.SKIPPED },
          'step-4': { status: StepStatus.NOT_STARTED },
        },
      }),
    ).toBe(true);

    // Test case 2: Mixed skipped/stopped - should return true
    expect(
      shouldSkipStepExecution({
        step: steps[3],
        steps,
        stepInfos: {
          'step-1': { status: StepStatus.SKIPPED },
          'step-2': { status: StepStatus.STOPPED },
          'step-3': { status: StepStatus.SKIPPED },
          'step-4': { status: StepStatus.NOT_STARTED },
        },
      }),
    ).toBe(true);

    // Test case 3: One success among skipped - should return false
    expect(
      shouldSkipStepExecution({
        step: steps[3],
        steps,
        stepInfos: {
          'step-1': { status: StepStatus.SKIPPED },
          'step-2': { status: StepStatus.SUCCESS },
          'step-3': { status: StepStatus.SKIPPED },
          'step-4': { status: StepStatus.NOT_STARTED },
        },
      }),
    ).toBe(false);

    // Test case 4: One failed among skipped - should return false
    expect(
      shouldSkipStepExecution({
        step: steps[3],
        steps,
        stepInfos: {
          'step-1': { status: StepStatus.SKIPPED },
          'step-2': { status: StepStatus.FAILED },
          'step-3': { status: StepStatus.SKIPPED },
          'step-4': { status: StepStatus.NOT_STARTED },
        },
      }),
    ).toBe(false);
  });
});
