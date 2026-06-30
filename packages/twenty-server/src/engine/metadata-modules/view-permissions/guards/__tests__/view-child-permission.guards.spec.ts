import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { CreateViewFieldGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-group-permission.guard';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { CreateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-group-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { DestroyViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-sort-permission.guard';
import { UpdateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-group-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { UpsertFieldsWidgetPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/upsert-fields-widget-permission.guard';
import { type ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { type ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';

describe('view child permission guards', () => {
  const workspaceId = 'workspace-id';
  const userWorkspaceId = 'regular-user-workspace-id';
  const unlockedViewId = 'unlocked-view-id';
  const lockedViewId = 'locked-view-id';
  const unlockedEntityId = 'unlocked-entity-id';
  const lockedEntityId = 'locked-entity-id';
  const widgetId = 'widget-id';
  const lockedViewError = Object.assign(new Error('Locked view'), {
    code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
  });

  const viewAccessService = {
    canUserModifyViewByChildEntity: jest.fn(),
  };

  const viewEntityLookupService = {
    findViewIdByEntityIdAndKind: jest.fn(),
  };

  const workspaceManyOrAllFlatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
  };

  const mockGqlExecutionContext = (args: Record<string, unknown>) => {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({
        req: {
          userWorkspaceId,
          workspace: { id: workspaceId },
          body: {},
          params: {},
        },
      }),
      getArgs: () => args,
    } as never);
  };

  const mockLockedViewAccess = () => {
    viewAccessService.canUserModifyViewByChildEntity.mockImplementation(
      async (viewId: string | null) => {
        if (viewId === lockedViewId) {
          throw lockedViewError;
        }

        return true;
      },
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLockedViewAccess();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    [
      'createManyViewFields',
      () =>
        new CreateViewFieldPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
        ),
    ],
    [
      'createManyViewGroups',
      () =>
        new CreateViewGroupPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
        ),
    ],
    [
      'createManyViewFieldGroups',
      () =>
        new CreateViewFieldGroupPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
        ),
    ],
  ])('%s', (_, buildGuard) => {
    it('rejects regular users when a later bulk input targets a locked view', async () => {
      mockGqlExecutionContext({
        inputs: [{ viewId: unlockedViewId }, { viewId: lockedViewId }],
      });

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).rejects.toMatchObject({
        code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
      });

      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        unlockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });

    it('allows users with VIEWS permission when every bulk input is authorized', async () => {
      mockGqlExecutionContext({
        inputs: [{ viewId: unlockedViewId }, { viewId: lockedViewId }],
      });
      viewAccessService.canUserModifyViewByChildEntity.mockResolvedValue(true);

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).resolves.toBe(true);

      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateManyViewGroups', () => {
    const buildGuard = () =>
      new UpdateViewGroupPermissionGuard(
        viewAccessService as unknown as ViewAccessService,
        viewEntityLookupService as unknown as ViewEntityLookupService,
      );

    beforeEach(() => {
      viewEntityLookupService.findViewIdByEntityIdAndKind.mockImplementation(
        async (_kind: string, entityId: string) => {
          if (entityId === lockedEntityId) {
            return lockedViewId;
          }

          return unlockedViewId;
        },
      );
    });

    it('rejects regular users when a later update input targets a locked view group', async () => {
      mockGqlExecutionContext({
        inputs: [{ id: unlockedEntityId }, { id: lockedEntityId }],
      });

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).rejects.toMatchObject({
        code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
      });

      expect(
        viewEntityLookupService.findViewIdByEntityIdAndKind,
      ).toHaveBeenCalledWith('viewGroup', unlockedEntityId, workspaceId);
      expect(
        viewEntityLookupService.findViewIdByEntityIdAndKind,
      ).toHaveBeenCalledWith('viewGroup', lockedEntityId, workspaceId);
      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });

    it('allows users with VIEWS permission when every update input is authorized', async () => {
      mockGqlExecutionContext({
        inputs: [{ id: unlockedEntityId }, { id: lockedEntityId }],
      });
      viewAccessService.canUserModifyViewByChildEntity.mockResolvedValue(true);

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).resolves.toBe(true);

      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('upsertFieldsWidget', () => {
    const buildGuard = () =>
      new UpsertFieldsWidgetPermissionGuard(
        viewAccessService as unknown as ViewAccessService,
        workspaceManyOrAllFlatEntityMapsCacheService as never,
      );

    beforeEach(() => {
      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatPageLayoutWidgetMaps: {
            universalIdentifierById: {
              [widgetId]: 'widget-universal-identifier',
            },
            byUniversalIdentifier: {
              'widget-universal-identifier': {
                id: widgetId,
                configuration: {
                  configurationType: WidgetConfigurationType.FIELDS,
                  viewId: lockedViewId,
                },
              },
            },
          },
        },
      );
    });

    it('rejects regular users when the fields widget targets a locked view', async () => {
      mockGqlExecutionContext({
        input: { widgetId },
      });

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).rejects.toMatchObject({
        code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
      });

      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });

    it('allows users with VIEWS permission to upsert fields widgets for locked views', async () => {
      mockGqlExecutionContext({
        input: { widgetId },
      });
      viewAccessService.canUserModifyViewByChildEntity.mockResolvedValue(true);

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).resolves.toBe(true);

      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });
  });

  describe.each([
    [
      'updateViewSort',
      () =>
        new UpdateViewSortPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
          viewEntityLookupService as unknown as ViewEntityLookupService,
        ),
    ],
    [
      'deleteViewSort',
      () =>
        new DeleteViewSortPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
          viewEntityLookupService as unknown as ViewEntityLookupService,
        ),
    ],
    [
      'destroyViewSort',
      () =>
        new DestroyViewSortPermissionGuard(
          viewAccessService as unknown as ViewAccessService,
          viewEntityLookupService as unknown as ViewEntityLookupService,
        ),
    ],
  ])('%s', (_, buildGuard) => {
    beforeEach(() => {
      viewEntityLookupService.findViewIdByEntityIdAndKind.mockResolvedValue(
        lockedViewId,
      );
    });

    it('rejects regular users when args.input.id targets a locked view sort', async () => {
      mockGqlExecutionContext({
        input: { id: lockedEntityId },
      });

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).rejects.toMatchObject({
        code: ViewExceptionCode.VIEW_LOCKED_PERMISSION_DENIED,
      });

      expect(
        viewEntityLookupService.findViewIdByEntityIdAndKind,
      ).toHaveBeenCalledWith('viewSort', lockedEntityId, workspaceId);
      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });

    it('allows users with VIEWS permission when args.input.id targets a locked view sort', async () => {
      mockGqlExecutionContext({
        input: { id: lockedEntityId },
      });
      viewAccessService.canUserModifyViewByChildEntity.mockResolvedValue(true);

      await expect(
        buildGuard().canActivate({} as ExecutionContext),
      ).resolves.toBe(true);

      expect(
        viewEntityLookupService.findViewIdByEntityIdAndKind,
      ).toHaveBeenCalledWith('viewSort', lockedEntityId, workspaceId);
      expect(
        viewAccessService.canUserModifyViewByChildEntity,
      ).toHaveBeenCalledWith(
        lockedViewId,
        userWorkspaceId,
        workspaceId,
        undefined,
      );
    });
  });
});
