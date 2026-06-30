import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';

import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

describe('ViewAccessService', () => {
  const workspaceId = 'workspace-id';
  const userWorkspaceId = 'user-workspace-id';
  const viewId = 'view-id';

  const viewService = {
    findByIdIncludingDeleted: jest.fn(),
  };

  const permissionsService = {
    getUserWorkspacePermissions: jest.fn(),
    userHasWorkspaceSettingPermission: jest.fn(),
  };

  const service = new ViewAccessService(
    viewService as unknown as ViewService,
    permissionsService as unknown as PermissionsService,
  );

  const baseView = {
    id: viewId,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: 'creator-id',
    isLocked: false,
  } as ViewEntity;

  const mockViewsPermission = (hasViewsPermission: boolean) => {
    permissionsService.getUserWorkspacePermissions.mockResolvedValue({
      permissionFlags: {
        [PermissionFlagType.VIEWS]: hasViewsPermission,
      },
      objectsPermissions: {},
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );
  });

  it('denies regular users updating locked views', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      isLocked: true,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyView(viewId, userWorkspaceId, workspaceId),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it('denies regular users deleting locked views through the same modify check', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      isLocked: true,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyView(viewId, userWorkspaceId, workspaceId),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it.each([
    'view fields',
    'view field groups',
    'view filters',
    'view filter groups',
    'view sorts',
    'view groups',
  ])('denies regular users mutating locked %s', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      isLocked: true,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyViewByChildEntity(
        viewId,
        userWorkspaceId,
        workspaceId,
      ),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it('allows users with views permission to update locked views', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      isLocked: true,
    });
    mockViewsPermission(true);

    await expect(
      service.canUserModifyView(viewId, userWorkspaceId, workspaceId),
    ).resolves.toBe(true);
  });

  it('allows regular users to update their own unlocked unlisted views', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: userWorkspaceId,
      isLocked: false,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyView(viewId, userWorkspaceId, workspaceId),
    ).resolves.toBe(true);
  });

  it('denies regular users updating their own locked unlisted views', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: userWorkspaceId,
      isLocked: true,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyView(viewId, userWorkspaceId, workspaceId),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it('denies regular users locking or unlocking an otherwise editable view', async () => {
    viewService.findByIdIncludingDeleted.mockResolvedValue({
      ...baseView,
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: userWorkspaceId,
      isLocked: false,
    });
    mockViewsPermission(false);

    await expect(
      service.canUserModifyView(
        viewId,
        userWorkspaceId,
        workspaceId,
        undefined,
        {
          isLockUpdateRequested: true,
        },
      ),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it('allows regular users to create unlocked unlisted views', async () => {
    mockViewsPermission(false);

    await expect(
      service.canUserCreateView(
        ViewVisibility.UNLISTED,
        false,
        userWorkspaceId,
        workspaceId,
      ),
    ).resolves.toBe(true);
  });

  it('denies regular users creating locked views', async () => {
    mockViewsPermission(false);

    await expect(
      service.canUserCreateView(
        ViewVisibility.UNLISTED,
        true,
        userWorkspaceId,
        workspaceId,
      ),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
    });
  });

  it('keeps API keys from creating locked unlisted views', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );

    await expect(
      service.canUserCreateView(
        ViewVisibility.UNLISTED,
        true,
        undefined,
        workspaceId,
        'api-key-id',
      ),
    ).rejects.toMatchObject({
      code: ViewExceptionCode.VIEW_CREATE_PERMISSION_DENIED,
    });
  });

  it('allows users with views permission to create locked workspace views', async () => {
    mockViewsPermission(true);

    await expect(
      service.canUserCreateView(
        ViewVisibility.WORKSPACE,
        true,
        userWorkspaceId,
        workspaceId,
      ),
    ).resolves.toBe(true);
  });
});
