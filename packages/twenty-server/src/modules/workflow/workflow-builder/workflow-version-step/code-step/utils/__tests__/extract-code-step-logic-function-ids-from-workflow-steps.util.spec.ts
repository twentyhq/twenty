import { WorkflowVersionStepException } from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import {
  type CodeStepForLogicFunctionIdExtraction,
  extractCodeStepLogicFunctionIdsFromWorkflowSteps,
  type NonCodeStepForLogicFunctionIdExtraction,
} from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/utils/extract-code-step-logic-function-ids-from-workflow-steps.util';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildCodeStep = (
  logicFunctionId: string,
): CodeStepForLogicFunctionIdExtraction => ({
  id: 'step-id',
  type: WorkflowActionType.CODE,
  settings: {
    input: {
      logicFunctionId,
    },
  },
});

const buildNonCodeStep = (): NonCodeStepForLogicFunctionIdExtraction => ({
  id: 'send-email-id',
  type: WorkflowActionType.SEND_EMAIL,
});

describe('extractCodeStepLogicFunctionIdsFromWorkflowSteps', () => {
  it('should return logic function ids of CODE steps', () => {
    const steps = [
      buildCodeStep('logic-function-1'),
      buildCodeStep('logic-function-2'),
    ];

    expect(extractCodeStepLogicFunctionIdsFromWorkflowSteps(steps)).toEqual([
      'logic-function-1',
      'logic-function-2',
    ]);
  });

  it('should ignore non-CODE steps', () => {
    const steps = [
      buildCodeStep('logic-function-1'),
      buildNonCodeStep(),
      buildCodeStep('logic-function-2'),
    ];

    expect(extractCodeStepLogicFunctionIdsFromWorkflowSteps(steps)).toEqual([
      'logic-function-1',
      'logic-function-2',
    ]);
  });

  it('should throw when a CODE step has an empty logic function id', () => {
    const steps = [buildCodeStep(''), buildCodeStep('logic-function-1')];

    expect(() =>
      extractCodeStepLogicFunctionIdsFromWorkflowSteps(steps),
    ).toThrow(WorkflowVersionStepException);
  });

  it('should return an empty array when there are no CODE steps', () => {
    expect(
      extractCodeStepLogicFunctionIdsFromWorkflowSteps([buildNonCodeStep()]),
    ).toEqual([]);
  });

  it('should return an empty array for an empty list of steps', () => {
    expect(extractCodeStepLogicFunctionIdsFromWorkflowSteps([])).toEqual([]);
  });
});
