import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertStepTypeAvailableToApplicationRun } from 'src/modules/workflow/workflow-executor/utils/assert-step-type-available-to-application-run.util';

describe('assertStepTypeAvailableToApplicationRun', () => {
  it.each([
    WorkflowActionType.SEND_EMAIL,
    WorkflowActionType.DRAFT_EMAIL,
    WorkflowActionType.CREATE_CALENDAR_EVENT,
  ])('refuses %s steps in a run started by an application', (stepType) => {
    expect(() =>
      assertStepTypeAvailableToApplicationRun({
        stepType,
        runApplicationId: 'installed-app-id',
      }),
    ).toThrow(`Applications cannot use ${stepType} steps`);
  });

  it('lets a run started by an application use other steps', () => {
    expect(() =>
      assertStepTypeAvailableToApplicationRun({
        stepType: WorkflowActionType.CREATE_RECORD,
        runApplicationId: 'installed-app-id',
      }),
    ).not.toThrow();
  });

  it('lets a run without an application send emails', () => {
    expect(() =>
      assertStepTypeAvailableToApplicationRun({
        stepType: WorkflowActionType.SEND_EMAIL,
        runApplicationId: undefined,
      }),
    ).not.toThrow();
  });
});
