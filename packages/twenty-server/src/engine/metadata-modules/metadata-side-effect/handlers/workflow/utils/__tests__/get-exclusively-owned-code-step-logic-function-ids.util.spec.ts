import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { getExclusivelyOwnedCodeStepLogicFunctionIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-code-step-logic-function-ids.util';

const DELETED_CODE_FUNCTION_ID = '11111111-1111-4111-8111-111111111111';
const SHARED_CODE_FUNCTION_ID = '22222222-2222-4222-8222-222222222222';
const APPLICATION_FUNCTION_ID = '33333333-3333-4333-8333-333333333333';

const buildStep = (
  type: WorkflowActionType.CODE | WorkflowActionType.LOGIC_FUNCTION,
  logicFunctionId: string | undefined,
) =>
  ({
    id: `${type}-${logicFunctionId}`,
    name: type,
    type,
    valid: true,
    nextStepIds: [],
    settings: { input: { logicFunctionId } },
  }) as unknown as WorkflowAction;

describe('getExclusivelyOwnedCodeStepLogicFunctionIds', () => {
  it('returns the CODE functions that no remaining version references', () => {
    expect(
      getExclusivelyOwnedCodeStepLogicFunctionIds({
        deletedWorkflowVersions: [
          {
            steps: [
              buildStep(WorkflowActionType.CODE, DELETED_CODE_FUNCTION_ID),
              buildStep(WorkflowActionType.CODE, SHARED_CODE_FUNCTION_ID),
            ],
          },
          {
            steps: [
              buildStep(WorkflowActionType.CODE, DELETED_CODE_FUNCTION_ID),
            ],
          },
        ],
        remainingWorkflowVersions: [
          {
            steps: [
              buildStep(
                WorkflowActionType.LOGIC_FUNCTION,
                SHARED_CODE_FUNCTION_ID,
              ),
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
            steps: [
              buildStep(
                WorkflowActionType.LOGIC_FUNCTION,
                APPLICATION_FUNCTION_ID,
              ),
            ],
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
          { steps: [buildStep(WorkflowActionType.CODE, undefined)] },
        ],
        remainingWorkflowVersions: [{ steps: null }],
      }),
    ).toEqual([]);
  });
});
