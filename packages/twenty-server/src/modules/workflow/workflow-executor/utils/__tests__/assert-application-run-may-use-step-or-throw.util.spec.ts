import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { assertApplicationRunMayUseStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/assert-application-run-may-use-step-or-throw.util';

const grantedFlags =
  (...flags: PermissionFlagType[]) =>
  async ({ permissionFlag }: { permissionFlag: PermissionFlagType }) =>
    flags.includes(permissionFlag);

describe('assertApplicationRunMayUseStepOrThrow', () => {
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
        assertApplicationRunMayUseStepOrThrow({
          stepType,
          runApplicationId: 'installed-app-id',
          applicationHasPermissionFlag: grantedFlags(permissionFlag),
        }),
      ).resolves.toBeUndefined();
    },
  );

  it('refuses an email step when the application role lacks the permission', async () => {
    await expect(
      assertApplicationRunMayUseStepOrThrow({
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

    await assertApplicationRunMayUseStepOrThrow({
      stepType: WorkflowActionType.CREATE_RECORD,
      runApplicationId: 'installed-app-id',
      applicationHasPermissionFlag,
    });
    await assertApplicationRunMayUseStepOrThrow({
      stepType: WorkflowActionType.SEND_EMAIL,
      runApplicationId: undefined,
      applicationHasPermissionFlag,
    });

    expect(applicationHasPermissionFlag).not.toHaveBeenCalled();
  });
});
