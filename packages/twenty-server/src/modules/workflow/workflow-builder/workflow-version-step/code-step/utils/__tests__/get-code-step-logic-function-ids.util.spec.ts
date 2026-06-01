import { getCodeStepLogicFunctionIds } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/utils/get-code-step-logic-function-ids.util';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildCodeStep = (logicFunctionId: string): WorkflowAction =>
  ({
    id: 'step-id',
    name: 'A Code Step',
    type: WorkflowActionType.CODE,
    valid: true,
    settings: {
      input: {
        logicFunctionId,
        logicFunctionInput: {},
      },
    },
  }) as WorkflowAction;

const buildNonCodeStep = (): WorkflowAction =>
  ({
    id: 'send-email-id',
    name: 'Send Email',
    type: WorkflowActionType.SEND_EMAIL,
    valid: true,
    settings: {
      input: {},
    },
  }) as unknown as WorkflowAction;

describe('getCodeStepLogicFunctionIds', () => {
  it('should return logic function ids of CODE steps', () => {
    const steps = [
      buildCodeStep('logic-function-1'),
      buildCodeStep('logic-function-2'),
    ];

    expect(getCodeStepLogicFunctionIds(steps)).toEqual([
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

    expect(getCodeStepLogicFunctionIds(steps)).toEqual([
      'logic-function-1',
      'logic-function-2',
    ]);
  });

  it('should filter out CODE steps with an empty logic function id', () => {
    const steps = [buildCodeStep(''), buildCodeStep('logic-function-1')];

    expect(getCodeStepLogicFunctionIds(steps)).toEqual(['logic-function-1']);
  });

  it('should return an empty array when there are no CODE steps', () => {
    expect(getCodeStepLogicFunctionIds([buildNonCodeStep()])).toEqual([]);
  });

  it('should return an empty array for an empty list of steps', () => {
    expect(getCodeStepLogicFunctionIds([])).toEqual([]);
  });
});
