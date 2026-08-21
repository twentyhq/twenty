import { WorkflowActionType } from 'twenty-shared/workflow';

import { WORKFLOW_STEP_MAX_ATTEMPTS } from 'src/modules/workflow/workflow-executor/constants/workflow-step-retry.constant';
import { getStepMaxAttempts } from 'src/modules/workflow/workflow-executor/utils/get-step-max-attempts.util';

// Every action type is spelled out so that adding one forces a decision on
// whether replaying it would repeat an effect it already committed.
const EXPECTED_MAX_ATTEMPTS: Record<WorkflowActionType, number> = {
  [WorkflowActionType.CODE]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.LOGIC_FUNCTION]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.SEND_EMAIL]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.DRAFT_EMAIL]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.CREATE_CALENDAR_EVENT]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.CREATE_RECORD]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.UPDATE_RECORD]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.DELETE_RECORD]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.UPSERT_RECORD]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.FIND_RECORDS]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.FORM]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.FILTER]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.IF_ELSE]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.HTTP_REQUEST]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.EMPTY]: WORKFLOW_STEP_MAX_ATTEMPTS,
  [WorkflowActionType.ITERATOR]: 1,
  [WorkflowActionType.PICK_RECORD]: 1,
  [WorkflowActionType.AI_AGENT]: 1,
  [WorkflowActionType.DELAY]: 1,
};

describe('getStepMaxAttempts', () => {
  it('covers every action type', () => {
    expect(Object.keys(EXPECTED_MAX_ATTEMPTS).sort()).toEqual(
      Object.values(WorkflowActionType).sort(),
    );
  });

  it.each(Object.entries(EXPECTED_MAX_ATTEMPTS))(
    'allows %s %i attempts',
    (stepType, expectedMaxAttempts) => {
      expect(getStepMaxAttempts(stepType as WorkflowActionType)).toBe(
        expectedMaxAttempts,
      );
    },
  );
});
