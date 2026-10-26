import { Test } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ApplicationWorkflowStepPermissionService } from 'src/modules/workflow/workflow-executor/services/application-workflow-step-permission.service';

describe('ApplicationWorkflowStepPermissionService', () => {
  const userHasWorkspaceSettingPermission = jest.fn();
  let service: ApplicationWorkflowStepPermissionService;

  const grantFlags = (...flags: PermissionFlagType[]) =>
    userHasWorkspaceSettingPermission.mockImplementation(
      async ({ setting }: { setting: PermissionFlagType }) =>
        flags.includes(setting),
    );

  beforeEach(async () => {
    userHasWorkspaceSettingPermission.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        ApplicationWorkflowStepPermissionService,
        {
          provide: PermissionsService,
          useValue: { userHasWorkspaceSettingPermission },
        },
      ],
    }).compile();

    service = module.get(ApplicationWorkflowStepPermissionService);
  });

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
      grantFlags(permissionFlag);

      await expect(
        service.assertRunApplicationMayUseStepOrThrow({
          workspaceId: 'workspace-id',
          runApplicationId: 'installed-app-id',
          stepType,
        }),
      ).resolves.toBeUndefined();
      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          applicationId: 'installed-app-id',
          setting: permissionFlag,
        }),
      );
    },
  );

  it('refuses an email step when the application role lacks the permission', async () => {
    grantFlags(PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL);

    await expect(
      service.assertRunApplicationMayUseStepOrThrow({
        workspaceId: 'workspace-id',
        runApplicationId: 'installed-app-id',
        stepType: WorkflowActionType.SEND_EMAIL,
      }),
    ).rejects.toThrow(
      'This application needs the SEND_EMAIL_TOOL permission to run SEND_EMAIL steps',
    );
  });

  it('does not look up permissions for other steps or runs without an application', async () => {
    await service.assertRunApplicationMayUseStepOrThrow({
      workspaceId: 'workspace-id',
      runApplicationId: 'installed-app-id',
      stepType: WorkflowActionType.CREATE_RECORD,
    });
    await service.assertRunApplicationMayUseStepOrThrow({
      workspaceId: 'workspace-id',
      runApplicationId: undefined,
      stepType: WorkflowActionType.SEND_EMAIL,
    });

    expect(userHasWorkspaceSettingPermission).not.toHaveBeenCalled();
  });
});
