import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertStepTypeAvailableToRun } from 'src/modules/workflow/workflow-executor/utils/assert-step-type-available-to-run.util';

describe('assertStepTypeAvailableToRun', () => {
  it.each([
    WorkflowActionType.SEND_EMAIL,
    WorkflowActionType.DRAFT_EMAIL,
    WorkflowActionType.CREATE_CALENDAR_EVENT,
  ])('refuses %s steps in a run started by an application', (stepType) => {
    expect(() =>
      assertStepTypeAvailableToRun({
        stepType,
        runApplicationId: 'installed-app-id',
      }),
    ).toThrow(`${stepType} steps cannot run`);
  });

  it('lets a run started by an application use other steps', () => {
    expect(() =>
      assertStepTypeAvailableToRun({
        stepType: WorkflowActionType.CREATE_RECORD,
        runApplicationId: 'installed-app-id',
      }),
    ).not.toThrow();
  });

  it('lets a run without an application send emails', () => {
    expect(() =>
      assertStepTypeAvailableToRun({
        stepType: WorkflowActionType.SEND_EMAIL,
        runApplicationId: undefined,
      }),
    ).not.toThrow();
  });
});
