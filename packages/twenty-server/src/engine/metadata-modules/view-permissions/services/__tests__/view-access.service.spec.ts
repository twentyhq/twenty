import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';

import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const VIEW_ID = '20202020-0000-0000-0000-000000000002';
const USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000003';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000004';

describe('ViewAccessService', () => {
  let service: ViewAccessService;

  const viewService = { findByIdIncludingDeleted: jest.fn() };
  const permissionsService = { userHasWorkspaceSettingPermission: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      id: VIEW_ID,
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: null,
    } as ViewEntity);
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewAccessService,
        { provide: ViewService, useValue: viewService },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    service = module.get(ViewAccessService);
  });

  it('authorises an application principal against its own role', async () => {
    await expect(
      service.canUserModifyView(VIEW_ID, {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      }),
    ).resolves.toBe(true);

    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      apiKeyId: undefined,
      applicationId: APPLICATION_ID,
      setting: PermissionFlagType.VIEWS,
    });
  });

  it('denies an application principal whose role lacks the views flag', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    await expect(
      service.canUserModifyView(VIEW_ID, {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      }),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
    });
  });

  it('authorises a user principal', async () => {
    await expect(
      service.canUserModifyView(VIEW_ID, {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      apiKeyId: undefined,
      applicationId: undefined,
      setting: PermissionFlagType.VIEWS,
    });
  });

  it('keeps both principals when an application token impersonates a user', async () => {
    await expect(
      service.canUserModifyView(VIEW_ID, {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      }),
    ).resolves.toBe(true);

    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      apiKeyId: undefined,
      applicationId: APPLICATION_ID,
      setting: PermissionFlagType.VIEWS,
    });
  });

  it('denies a request that names no principal without asking for permissions', async () => {
    await expect(
      service.canUserModifyView(VIEW_ID, { workspaceId: WORKSPACE_ID }),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
    });

    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).not.toHaveBeenCalled();
  });

  it('lets a user without the views flag modify their own unlisted view', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      id: VIEW_ID,
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: USER_WORKSPACE_ID,
    } as ViewEntity);

    await expect(
      service.canUserModifyView(VIEW_ID, {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
  });

  it('does not let an application create an unlisted view, which has no owner to record', async () => {
    await expect(
      service.canUserCreateView(ViewVisibility.UNLISTED, {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      }),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_CREATE_PERMISSION_DENIED,
    });
  });
});
