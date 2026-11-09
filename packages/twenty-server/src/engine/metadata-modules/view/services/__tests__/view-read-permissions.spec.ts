import { Test, type TestingModule } from '@nestjs/testing';

import { ViewVisibility } from 'twenty-shared/types';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  type WorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFieldGroupService } from 'src/engine/metadata-modules/view-field-group/services/view-field-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { MetadataReadPermissionsService } from 'src/engine/permissions/metadata-permissions/services/metadata-read-permissions.service';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace';
const APPLICATION_ID = 'application';
const OWNER_ID = 'owner';
const SHARED_VIEW_ID = 'shared';
const PRIVATE_VIEW_ID = 'private';
const CHILD_SERVICES = [
  ViewFieldService,
  ViewFieldGroupService,
  ViewFilterService,
  ViewFilterGroupService,
  ViewGroupService,
  ViewSortService,
];
const CHILD_MAP_NAMES = [
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatViewFilterMaps',
  'flatViewFilterGroupMaps',
  'flatViewGroupMaps',
  'flatViewSortMaps',
];
const CHILD_LOADER_NAMES = [
  'viewFieldsByViewIdLoader',
  'viewFieldGroupsByViewIdLoader',
  'viewFiltersByViewIdLoader',
  'viewFilterGroupsByViewIdLoader',
  'viewGroupsByViewIdLoader',
  'viewSortsByViewIdLoader',
] as const;

const makeMaps = <TEntity extends { id: string }>(entities: TEntity[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map(({ id }) => [id, id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const makeView = (
  id: string,
  visibility: ViewVisibility,
  createdByUserWorkspaceId: string | null = OWNER_ID,
) => ({
  id,
  universalIdentifier: id,
  workspaceId: WORKSPACE_ID,
  applicationId: APPLICATION_ID,
  visibility,
  createdByUserWorkspaceId,
  deletedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  overrides: null as FlatView['overrides'],
  position: id === PRIVATE_VIEW_ID ? 0 : 1,
  viewFieldIds: [id + '-child'],
  viewFieldGroupIds: [id + '-child'],
  viewFilterIds: [id + '-child'],
  viewFilterGroupIds: [id + '-child'],
  viewGroupIds: [id + '-child'],
  viewSortIds: [id + '-child'],
});

const makeUserContext = (userWorkspaceId: string): UserWorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: {
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: 'custom-application',
    },
    userWorkspaceId,
    workspaceMemberId: userWorkspaceId + '-member',
  }) as UserWorkspaceAuthContext;

const owner = makeUserContext(OWNER_ID);
const otherMember = makeUserContext('other');
const admin = makeUserContext('admin');
const application = {
  id: APPLICATION_ID,
  sourceType: 'local',
  universalIdentifier: APPLICATION_ID,
};
const apiKey = {
  type: 'apiKey',
  workspace: owner.workspace,
  apiKey: { id: 'api-key' },
} as WorkspaceAuthContext;
const applicationContext = {
  type: 'application',
  workspace: owner.workspace,
  application,
} as WorkspaceAuthContext;
const ownerThroughApplication = {
  ...owner,
  application,
} as WorkspaceAuthContext;

describe('Metadata private reads', () => {
  let module: TestingModule;
  let viewService: ViewService;
  let navigationService: NavigationMenuItemService;
  let roleMaps: Record<string, unknown>;

  const views = [
    makeView(PRIVATE_VIEW_ID, ViewVisibility.UNLISTED),
    makeView(SHARED_VIEW_ID, ViewVisibility.WORKSPACE),
    makeView('ownerless', ViewVisibility.UNLISTED, null),
    {
      ...makeView('deleted', ViewVisibility.UNLISTED),
      deletedAt: '2026-01-02T00:00:00.000Z',
    },
  ];
  const children = views.map((view) => ({
    ...view,
    id: view.id + '-child',
    universalIdentifier: view.id + '-child',
    viewId: view.id,
    viewFieldGroupId: view.id + '-child',
    deletedAt: null,
    isActive: true,
    positionInViewFilterGroup: view.position,
  }));
  const navigationItems = views.slice(0, 2).map((view) => ({
    ...view,
    userWorkspaceId:
      view.visibility === ViewVisibility.UNLISTED ? OWNER_ID : null,
  }));
  const maps = {
    flatViewMaps: makeMaps(views),
    flatNavigationMenuItemMaps: makeMaps(navigationItems),
    ...Object.fromEntries(
      CHILD_MAP_NAMES.map((name) => [name, makeMaps(children)]),
    ),
  };
  const repository = {
    find: jest.fn(async (_workspaceId, { where }) =>
      children.filter(
        (child) => !where.viewId || child.viewId === where.viewId,
      ),
    ),
    findOne: jest.fn(
      async (_workspaceId, { where }) =>
        children.find((child) => child.id === where.id) ?? null,
    ),
  };

  beforeAll(async () => {
    jest.useRealTimers();
    module = await Test.createTestingModule({
      providers: [
        ViewService,
        ...CHILD_SERVICES,
        NavigationMenuItemService,
        MetadataReadPermissionsService,
        PrincipalPermissionsReadService,
        DataloaderService,
      ],
    })
      .useMocker((token) => {
        if (token === WorkspaceManyOrAllFlatEntityMapsCacheService) {
          return {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(async () => maps),
          };
        }
        if (token === WorkspaceCacheService) {
          return { getOrRecompute: jest.fn(async () => roleMaps) };
        }
        if (typeof token === 'string' && token.includes('Repository')) {
          return repository;
        }
        return { create: jest.fn() };
      })
      .compile();
    viewService = module.get(ViewService);
    navigationService = module.get(NavigationMenuItemService);
  });

  beforeEach(() => {
    roleMaps = {
      userWorkspaceRoleMap: {
        owner: 'member-role',
        other: 'member-role',
        admin: 'admin-role',
      },
      apiKeyRoleMap: { 'api-key': 'admin-role' },
      flatRoleTargetByAgentIdMaps: { agent: { roleId: 'agent-role' } },
      flatApplicationMaps: {
        byId: {
          [APPLICATION_ID]: {
            ...application,
            defaultRoleId: 'application-role',
            deletedAt: null,
          },
          'other-application': {
            ...application,
            id: 'other-application',
            defaultRoleId: 'application-role',
            deletedAt: null,
          },
          'custom-application': {
            ...application,
            id: 'custom-application',
            defaultRoleId: 'application-role',
            deletedAt: null,
          },
        },
      },
      flatWorkspaceMemberMaps: {
        byId: Object.fromEntries(
          ['owner', 'other', 'admin'].map((id) => [
            id + '-member',
            { userId: id },
          ]),
        ),
        userWorkspaceIdByUserId: {
          owner: 'owner',
          other: 'other',
          admin: 'admin',
        },
      },
    };
  });

  afterAll(async () => {
    await module.close();
  });

  it.each([
    ['owner', owner, true],
    ['other member', otherMember, false],
    ['admin', admin, false],
    ['API key', apiKey, false],
    ['application', applicationContext, false],
    ['owner through application', ownerThroughApplication, true],
    ['owner with limiting agent', { ...owner, agentId: 'agent' }, true],
  ] as const)(
    '%s gets the same visibility through single, list and nested reads',
    async (_name, context, canReadPrivate) => {
      await workspaceAuthContextStorage.run(context, async () => {
        expect(
          Boolean(await viewService.findById(PRIVATE_VIEW_ID, WORKSPACE_ID)),
        ).toBe(canReadPrivate);
        expect(
          Boolean(
            await viewService.findByIdWithRelations(
              PRIVATE_VIEW_ID,
              WORKSPACE_ID,
            ),
          ),
        ).toBe(canReadPrivate);
        expect(
          await viewService.findById(SHARED_VIEW_ID, WORKSPACE_ID),
        ).toMatchObject({ id: SHARED_VIEW_ID });
        expect(
          await viewService.findById('ownerless', WORKSPACE_ID),
        ).toBeNull();
        expect(await viewService.findById('deleted', WORKSPACE_ID)).toBeNull();
        expect(await viewService.findById('missing', WORKSPACE_ID)).toBeNull();
        const visibleIds = canReadPrivate
          ? [PRIVATE_VIEW_ID, SHARED_VIEW_ID]
          : [SHARED_VIEW_ID];
        expect(
          (await viewService.findByWorkspaceId(WORKSPACE_ID)).map(
            ({ id }) => id,
          ),
        ).toEqual(visibleIds);
        const page = await viewService.findManyWithRelationsPaginated({
          workspaceId: WORKSPACE_ID,
          pagination: { limit: 1, direction: 'forward' },
        });
        expect(page.totalCount).toBe(visibleIds.length);
        expect(page.items.map(({ id }) => id)).toEqual(visibleIds.slice(0, 1));
        expect(
          Boolean(
            await navigationService.findById({
              id: PRIVATE_VIEW_ID,
              workspaceId: WORKSPACE_ID,
            }),
          ),
        ).toBe(canReadPrivate);
        expect(
          (await navigationService.findAll({ workspaceId: WORKSPACE_ID })).map(
            ({ id }) => id,
          ),
        ).toEqual(visibleIds);
      });
    },
  );

  it.each(CHILD_SERVICES)(
    '%p protects direct and parent-list child reads',
    async (Service) => {
      const service = module.get(Service);
      for (const context of [
        owner,
        otherMember,
        admin,
        apiKey,
        applicationContext,
        ownerThroughApplication,
      ]) {
        await workspaceAuthContextStorage.run(context, async () => {
          const canReadPrivate =
            context === owner || context === ownerThroughApplication;
          expect(
            Boolean(
              await service.findById(PRIVATE_VIEW_ID + '-child', WORKSPACE_ID),
            ),
          ).toBe(canReadPrivate);
          expect(await service.findById('missing', WORKSPACE_ID)).toBeNull();
          expect(
            await service.findById('ownerless-child', WORKSPACE_ID),
          ).toBeNull();
          expect(
            await service.findById('deleted-child', WORKSPACE_ID),
          ).toBeNull();
          expect(
            await service.findById(SHARED_VIEW_ID + '-child', WORKSPACE_ID),
          ).toMatchObject({ id: SHARED_VIEW_ID + '-child' });
          expect(
            (await service.findByViewId(WORKSPACE_ID, PRIVATE_VIEW_ID)).length,
          ).toBe(canReadPrivate ? 1 : 0);
          if ('findByWorkspaceId' in service) {
            expect(
              (await service.findByWorkspaceId(WORKSPACE_ID)).map(
                ({ id }) => id,
              ),
            ).toEqual(
              canReadPrivate
                ? [PRIVATE_VIEW_ID + '-child', SHARED_VIEW_ID + '-child']
                : [SHARED_VIEW_ID + '-child'],
            );
          }
        });
      }
    },
  );

  it.each(CHILD_LOADER_NAMES)(
    '%s checks privacy when resolving nested fields',
    async (loaderName) => {
      for (const context of [owner, otherMember]) {
        await workspaceAuthContextStorage.run(context, async () => {
          const loader = module.get(DataloaderService).createLoaders()[
            loaderName
          ];
          expect(
            (
              await loader.load({
                workspaceId: WORKSPACE_ID,
                viewId: PRIVATE_VIEW_ID,
              })
            ).length,
          ).toBe(context === owner ? 1 : 0);
          expect(
            (
              await loader.load({
                workspaceId: WORKSPACE_ID,
                viewId: SHARED_VIEW_ID,
              })
            ).length,
          ).toBe(1);
        });
      }
    },
  );

  it('does not expose a private view field referenced by a shared field group', async () => {
    const privateField = children[0];
    const originalGroupId = privateField.viewFieldGroupId;
    privateField.viewFieldGroupId = SHARED_VIEW_ID + '-child';
    try {
      await workspaceAuthContextStorage.run(otherMember, async () => {
        const loader = module
          .get(DataloaderService)
          .createLoaders().viewFieldsByViewFieldGroupIdLoader;
        expect(
          (
            await loader.load({
              workspaceId: WORKSPACE_ID,
              viewFieldGroupId: SHARED_VIEW_ID + '-child',
            })
          ).map(({ id }) => id),
        ).toEqual([SHARED_VIEW_ID + '-child']);
      });
    } finally {
      privateField.viewFieldGroupId = originalGroupId;
    }
  });

  it('checks the parent view when resolving a field group', async () => {
    for (const context of [owner, otherMember]) {
      await workspaceAuthContextStorage.run(context, async () => {
        const loader = module
          .get(DataloaderService)
          .createLoaders().viewFieldsByViewFieldGroupIdLoader;
        expect(
          (
            await loader.load({
              workspaceId: WORKSPACE_ID,
              viewFieldGroupId: PRIVATE_VIEW_ID + '-child',
            })
          ).length,
        ).toBe(context === owner ? 1 : 0);
      });
    }
  });

  it('filters hidden children before pagination and total counts', async () => {
    await workspaceAuthContextStorage.run(otherMember, async () => {
      const service = module.get(ViewFilterService);
      const page = await service.findManyPaginated({
        workspaceId: WORKSPACE_ID,
        pagination: { limit: 1, direction: 'forward' },
      });
      expect(page.totalCount).toBe(1);
      expect(page.items.map(({ id }) => id)).toEqual([
        SHARED_VIEW_ID + '-child',
      ]);
      for (const afterId of ['private-child', 'missing-child']) {
        expect(
          (
            await service.findManyPaginated({
              workspaceId: WORKSPACE_ID,
              pagination: { limit: 1, direction: 'forward', afterId },
            })
          ).items,
        ).toEqual([]);
      }
    });
  });

  it('does not let ownership bypass application reach or workspace boundaries', async () => {
    const context = {
      ...owner,
      application: { ...application, id: 'other-application' },
    } as WorkspaceAuthContext;
    await workspaceAuthContextStorage.run(context, async () => {
      expect(
        await viewService.findById(PRIVATE_VIEW_ID, WORKSPACE_ID),
      ).toBeNull();
      expect(
        await viewService.findById(SHARED_VIEW_ID, WORKSPACE_ID),
      ).toBeNull();
      expect(
        await navigationService.findAll({ workspaceId: WORKSPACE_ID }),
      ).toEqual([]);
    });
    await workspaceAuthContextStorage.run(owner, async () => {
      await expect(
        viewService.findById(PRIVATE_VIEW_ID, 'other-workspace'),
      ).rejects.toMatchObject({
        code: 'WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH',
      });
      await expect(
        module
          .get(ViewFieldService)
          .findById(PRIVATE_VIEW_ID + '-child', 'other-workspace'),
      ).rejects.toMatchObject({
        code: 'WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH',
      });
    });
  });

  it('retains workspace custom application read reach without granting private ownership', async () => {
    await workspaceAuthContextStorage.run(
      {
        ...applicationContext,
        application: { ...application, id: 'custom-application' },
      } as WorkspaceAuthContext,
      async () => {
        expect(
          await viewService.findById(SHARED_VIEW_ID, WORKSPACE_ID),
        ).toMatchObject({ id: SHARED_VIEW_ID });
        expect(
          await viewService.findById(PRIVATE_VIEW_ID, WORKSPACE_ID),
        ).toBeNull();
      },
    );
  });

  it('uses effective visibility when an application view has an override', async () => {
    const sharedView = maps.flatViewMaps.byUniversalIdentifier[SHARED_VIEW_ID];
    sharedView.overrides = {
      '20202020-aaaa-4aaa-8aaa-000000000001': {
        visibility: ViewVisibility.UNLISTED,
      },
    };
    try {
      await workspaceAuthContextStorage.run(otherMember, async () => {
        expect(
          await viewService.findById(SHARED_VIEW_ID, WORKSPACE_ID),
        ).toBeNull();
        expect(
          await module
            .get(ViewFieldService)
            .findById(SHARED_VIEW_ID + '-child', WORKSPACE_ID),
        ).toBeNull();
      });
      await workspaceAuthContextStorage.run(owner, async () => {
        expect(
          await viewService.findById(SHARED_VIEW_ID, WORKSPACE_ID),
        ).toMatchObject({ visibility: ViewVisibility.UNLISTED });
      });
    } finally {
      sharedView.overrides = null;
    }
  });

  it('rejects reads without authentication or a resolved principal', async () => {
    await expect(
      viewService.findById(PRIVATE_VIEW_ID, WORKSPACE_ID),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });

    for (const context of [
      makeUserContext('removed'),
      { ...owner, agentId: 'revoked-agent' },
    ]) {
      await workspaceAuthContextStorage.run(context, async () => {
        for (const viewId of [PRIVATE_VIEW_ID, SHARED_VIEW_ID]) {
          await expect(
            viewService.findById(viewId, WORKSPACE_ID),
          ).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
        }
      });
    }
  });

  it('allows explicit system access while excluding deleted views', async () => {
    await workspaceAuthContextStorage.run(
      { type: 'system', workspace: owner.workspace },
      async () => {
        expect(
          await viewService.findById(PRIVATE_VIEW_ID, WORKSPACE_ID),
        ).toMatchObject({ id: PRIVATE_VIEW_ID });
        expect(await viewService.findById('deleted', WORKSPACE_ID)).toBeNull();
        expect(
          await navigationService.findById({
            id: PRIVATE_VIEW_ID,
            workspaceId: WORKSPACE_ID,
          }),
        ).toMatchObject({ id: PRIVATE_VIEW_ID });
      },
    );
  });

  it('lets write authorization inspect private views without admitting deleted views', async () => {
    expect(
      await viewService.findByIdForPermissionCheck(
        PRIVATE_VIEW_ID,
        WORKSPACE_ID,
      ),
    ).toMatchObject({
      id: PRIVATE_VIEW_ID,
      visibility: ViewVisibility.UNLISTED,
    });
    expect(
      await viewService.findByIdForPermissionCheck('deleted', WORKSPACE_ID),
    ).toBeNull();
  });
});
