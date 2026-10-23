import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertStepTypeAvailableToApplicationRun } from 'src/modules/workflow/workflow-executor/utils/assert-step-type-available-to-application-run.util';

describe('assertStepTypeAvailableToApplicationRun', () => {
  it.each([
    WorkflowActionType.SEND_EMAIL,
    WorkflowActionType.DRAFT_EMAIL,
    WorkflowActionType.CREATE_CALENDAR_EVENT,
  ])(
    'refuses %s steps in a run started by an installed application',
    (stepType) => {
      expect(() =>
        assertStepTypeAvailableToApplicationRun({
          stepType,
          isInstalledApplicationRun: true,
        }),
      ).toThrow(`Applications cannot use ${stepType} steps`);
    },
  );

  it('lets a run started by an installed application use other steps', () => {
    expect(() =>
      assertStepTypeAvailableToApplicationRun({
        stepType: WorkflowActionType.CREATE_RECORD,
        isInstalledApplicationRun: true,
      }),
    ).not.toThrow();
  });

  it('lets a workspace run send emails', () => {
    expect(() =>
      assertStepTypeAvailableToApplicationRun({
        stepType: WorkflowActionType.SEND_EMAIL,
        isInstalledApplicationRun: false,
      }),
    ).not.toThrow();
  });
});
