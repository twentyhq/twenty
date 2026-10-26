import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertApplicationRunMayUseStep } from 'src/modules/workflow/workflow-executor/utils/assert-application-run-may-use-step.util';

const grantedFlags =
  (...flags: PermissionFlagType[]) =>
  async (_applicationId: string, permissionFlag: PermissionFlagType) =>
    flags.includes(permissionFlag);

describe('assertApplicationRunMayUseStep', () => {
  it.each([
    [WorkflowActionType.SEND_EMAIL, PermissionFlagType.SEND_EMAIL_TOOL],
    [WorkflowActionType.DRAFT_EMAIL, PermissionFlagType.SEND_EMAIL_TOOL],
    [
      WorkflowActionType.CREATE_CALENDAR_EVENT,
      PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
    ],
  ])(
    'lets an application run use %s steps when its role has %s',
    async (stepType, permissionFlag) => {
      await expect(
        assertApplicationRunMayUseStep({
          stepType,
          runApplicationId: 'installed-app-id',
          applicationHasPermissionFlag: grantedFlags(permissionFlag),
        }),
      ).resolves.toBeUndefined();
    },
  );

  it('refuses an email step when the application role lacks the permission', async () => {
    await expect(
      assertApplicationRunMayUseStep({
        stepType: WorkflowActionType.SEND_EMAIL,
        runApplicationId: 'installed-app-id',
        applicationHasPermissionFlag: grantedFlags(
          PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
        ),
      }),
    ).rejects.toThrow(
      'This application needs the SEND_EMAIL_TOOL permission to run SEND_EMAIL steps',
    );
  });

  it('does not look up permissions for other steps or runs without an application', async () => {
    const applicationHasPermissionFlag = jest.fn();

    await assertApplicationRunMayUseStep({
      stepType: WorkflowActionType.CREATE_RECORD,
      runApplicationId: 'installed-app-id',
      applicationHasPermissionFlag,
    });
    await assertApplicationRunMayUseStep({
      stepType: WorkflowActionType.SEND_EMAIL,
      runApplicationId: undefined,
      applicationHasPermissionFlag,
    });

    expect(applicationHasPermissionFlag).not.toHaveBeenCalled();
  });
});
