import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';
import { ViewAccessService } from 'src/engine/permissions/view/services/view-access.service';
import { type ViewAccessContext } from 'src/engine/permissions/view/types/view-permissions.type';

const workspaceId = 'workspace-id';
const userWorkspaceId = 'user-workspace-id';
const viewId = 'view-id';

const MODIFY_DENIED = 'You do not have permission to modify this view';
const CREATE_DENIED =
  'You do not have permission to create workspace-level views';

const ownUnlistedView = {
  visibility: ViewVisibility.UNLISTED,
  createdByUserWorkspaceId: userWorkspaceId,
};
const otherMembersUnlistedView = {
  visibility: ViewVisibility.UNLISTED,
  createdByUserWorkspaceId: 'other-user-workspace-id',
};
const workspaceView = {
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: userWorkspaceId,
};

const requestAccessContext: ViewAccessContext = {
  workspaceId,
  userWorkspaceId,
};
const toolAccessContext: ViewAccessContext = {
  workspaceId,
  userWorkspaceId,
  authContext: { type: 'user' } as UserWorkspaceAuthContext,
};

const buildViewAccessService = ({
  hasViewsPermission,
}: {
  hasViewsPermission: boolean;
}) => {
  const viewService = { findByIdIncludingDeleted: jest.fn() };
  const permissionsService = {
    hasPermissionFlag: jest.fn().mockResolvedValue(hasViewsPermission),
    userHasWorkspaceSettingPermission: jest
      .fn()
      .mockResolvedValue(hasViewsPermission),
  };

  return {
    viewAccessService: new ViewAccessService(
      viewService as unknown as ViewService,
      permissionsService as unknown as PermissionsService,
    ),
    viewService,
    permissionsService,
  };
};

describe('ViewAccessService', () => {
  describe('assertCanModifyView', () => {
    it('should let a member without VIEWS change their own unlisted view', async () => {
      const { viewAccessService, permissionsService } = buildViewAccessService({
        hasViewsPermission: false,
      });

      await expect(
        viewAccessService.assertCanModifyView({
          view: ownUnlistedView,
          accessContext: requestAccessContext,
          nextVisibility: ViewVisibility.UNLISTED,
        }),
      ).resolves.toBeUndefined();
      expect(
        permissionsService.userHasWorkspaceSettingPermission,
      ).not.toHaveBeenCalled();
    });

    it('should refuse publishing an own unlisted view without VIEWS', async () => {
      const { viewAccessService } = buildViewAccessService({
        hasViewsPermission: false,
      });

      await expect(
        viewAccessService.assertCanModifyView({
          view: ownUnlistedView,
          accessContext: requestAccessContext,
          nextVisibility: ViewVisibility.WORKSPACE,
        }),
      ).rejects.toThrow(MODIFY_DENIED);
    });

    it('should let a VIEWS holder publish an own unlisted view', async () => {
      const { viewAccessService } = buildViewAccessService({
        hasViewsPermission: true,
      });

      await expect(
        viewAccessService.assertCanModifyView({
          view: ownUnlistedView,
          accessContext: requestAccessContext,
          nextVisibility: ViewVisibility.WORKSPACE,
        }),
      ).resolves.toBeUndefined();
    });

    it('should require VIEWS to change a workspace view', async () => {
      await expect(
        buildViewAccessService({
          hasViewsPermission: false,
        }).viewAccessService.assertCanModifyView({
          view: workspaceView,
          accessContext: requestAccessContext,
        }),
      ).rejects.toThrow(MODIFY_DENIED);

      await expect(
        buildViewAccessService({
          hasViewsPermission: true,
        }).viewAccessService.assertCanModifyView({
          view: workspaceView,
          accessContext: requestAccessContext,
        }),
      ).resolves.toBeUndefined();
    });

    it("should let a VIEWS holder change another member's unlisted view unless restricted to its owner", async () => {
      const { viewAccessService } = buildViewAccessService({
        hasViewsPermission: true,
      });

      await expect(
        viewAccessService.assertCanModifyView({
          view: otherMembersUnlistedView,
          accessContext: requestAccessContext,
        }),
      ).resolves.toBeUndefined();

      await expect(
        viewAccessService.assertCanModifyView({
          view: otherMembersUnlistedView,
          accessContext: requestAccessContext,
          unlistedViewsOwnerOnly: true,
        }),
      ).rejects.toThrow(MODIFY_DENIED);
    });

    it('should check VIEWS through the auth context when one is given', async () => {
      const { viewAccessService, permissionsService } = buildViewAccessService({
        hasViewsPermission: true,
      });

      await viewAccessService.assertCanModifyView({
        view: workspaceView,
        accessContext: toolAccessContext,
      });

      expect(permissionsService.hasPermissionFlag).toHaveBeenCalledWith({
        authContext: toolAccessContext.authContext,
        setting: PermissionFlagType.VIEWS,
      });
      expect(
        permissionsService.userHasWorkspaceSettingPermission,
      ).not.toHaveBeenCalled();
    });
  });

  describe('canUserModifyView', () => {
    it('should let a missing view through', async () => {
      const { viewAccessService, viewService } = buildViewAccessService({
        hasViewsPermission: false,
      });

      viewService.findByIdIncludingDeleted.mockResolvedValue(null);

      await expect(
        viewAccessService.canUserModifyView(viewId, requestAccessContext),
      ).resolves.toBe(true);
    });

    it('should check the visibility the update sets', async () => {
      const { viewAccessService, viewService } = buildViewAccessService({
        hasViewsPermission: false,
      });

      viewService.findByIdIncludingDeleted.mockResolvedValue(ownUnlistedView);

      await expect(
        viewAccessService.canUserModifyView(viewId, requestAccessContext),
      ).resolves.toBe(true);
      await expect(
        viewAccessService.canUserModifyView(
          viewId,
          requestAccessContext,
          ViewVisibility.WORKSPACE,
        ),
      ).rejects.toThrow(MODIFY_DENIED);
    });
  });

  describe('canUserCreateView', () => {
    it('should let a member without VIEWS create an unlisted view', async () => {
      await expect(
        buildViewAccessService({
          hasViewsPermission: false,
        }).viewAccessService.canUserCreateView(
          ViewVisibility.UNLISTED,
          requestAccessContext,
        ),
      ).resolves.toBe(true);
    });

    it('should refuse an unlisted view without a user to own it', async () => {
      await expect(
        buildViewAccessService({
          hasViewsPermission: true,
        }).viewAccessService.canUserCreateView(ViewVisibility.UNLISTED, {
          workspaceId,
          apiKeyId: 'api-key-id',
        }),
      ).rejects.toThrow(CREATE_DENIED);
    });

    it('should require VIEWS to create a workspace view', async () => {
      await expect(
        buildViewAccessService({
          hasViewsPermission: false,
        }).viewAccessService.canUserCreateView(
          ViewVisibility.WORKSPACE,
          requestAccessContext,
        ),
      ).rejects.toThrow(CREATE_DENIED);
    });
  });
});
