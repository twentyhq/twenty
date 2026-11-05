import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowCodeAction,
  type WorkflowLogicFunctionAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { getExclusivelyOwnedCodeStepLogicFunctionIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-code-step-logic-function-ids.util';

const DELETED_CODE_FUNCTION_ID = '11111111-1111-4111-8111-111111111111';
const SHARED_CODE_FUNCTION_ID = '22222222-2222-4222-8222-222222222222';
const APPLICATION_FUNCTION_ID = '33333333-3333-4333-8333-333333333333';
const SHARED_BY_CODE_FUNCTION_ID = '44444444-4444-4444-8444-444444444444';

const BASE_STEP_SETTINGS = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const buildCodeStep = (
  logicFunctionId: string | undefined,
): WorkflowCodeAction => ({
  id: `${WorkflowActionType.CODE}-${logicFunctionId}`,
  name: WorkflowActionType.CODE,
  type: WorkflowActionType.CODE,
  valid: true,
  nextStepIds: [],
  settings: {
    ...BASE_STEP_SETTINGS,
    input: { logicFunctionId, logicFunctionInput: {} },
  },
});

const buildLogicFunctionStep = (
  logicFunctionId: string,
): WorkflowLogicFunctionAction => ({
  id: `${WorkflowActionType.LOGIC_FUNCTION}-${logicFunctionId}`,
  name: WorkflowActionType.LOGIC_FUNCTION,
  type: WorkflowActionType.LOGIC_FUNCTION,
  valid: true,
  nextStepIds: [],
  settings: {
    ...BASE_STEP_SETTINGS,
    input: { logicFunctionId, logicFunctionInput: {} },
  },
});

describe('getExclusivelyOwnedCodeStepLogicFunctionIds', () => {
  it('returns the CODE functions that no remaining version references', () => {
    expect(
      getExclusivelyOwnedCodeStepLogicFunctionIds({
        deletedWorkflowVersions: [
          {
            steps: [
              buildCodeStep(DELETED_CODE_FUNCTION_ID),
              buildCodeStep(SHARED_CODE_FUNCTION_ID),
            ],
          },
          {
            steps: [
              buildCodeStep(DELETED_CODE_FUNCTION_ID),
              buildCodeStep(SHARED_BY_CODE_FUNCTION_ID),
            ],
          },
        ],
        remainingWorkflowVersions: [
          {
            steps: [
              buildLogicFunctionStep(SHARED_CODE_FUNCTION_ID),
              buildCodeStep(SHARED_BY_CODE_FUNCTION_ID),
            ],
          },
        ],
      }),
    ).toEqual([DELETED_CODE_FUNCTION_ID]);
  });

  it('keeps functions referenced by LOGIC_FUNCTION steps of the deleted workflow', () => {
    expect(
      getExclusivelyOwnedCodeStepLogicFunctionIds({
        deletedWorkflowVersions: [
          {
            steps: [buildLogicFunctionStep(APPLICATION_FUNCTION_ID)],
          },
        ],
        remainingWorkflowVersions: [],
      }),
    ).toEqual([]);
  });

  it('ignores steps without a valid function id and versions without steps', () => {
    expect(
      getExclusivelyOwnedCodeStepLogicFunctionIds({
        deletedWorkflowVersions: [
          { steps: null },
          { steps: [buildCodeStep(undefined)] },
        ],
        remainingWorkflowVersions: [{ steps: null }],
      }),
    ).toEqual([]);
  });
});
