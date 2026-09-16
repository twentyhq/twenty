import { Test, type TestingModule } from '@nestjs/testing';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { PageLayoutDuplicationService } from 'src/engine/metadata-modules/page-layout/services/page-layout-duplication.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  DashboardException,
  DashboardExceptionCode,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const ROLE_ID = 'role-id';
const DASHBOARD_OBJECT_METADATA_ID = 'dashboard-object-id';
const DASHBOARD_ID = 'dashboard-id';
const PAGE_LAYOUT_ID = 'page-layout-id';

const authContext = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_ID,
  user: { id: 'user-id' },
  workspaceMember: { id: 'workspace-member-id' },
} as unknown as WorkspaceAuthContext;

const originalDashboard = {
  id: DASHBOARD_ID,
  title: 'Sales',
  pageLayoutId: PAGE_LAYOUT_ID,
  position: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const buildWorkspaceContext = ({
  canUpdateObjectRecords = true,
  userWorkspaceRoleMap = { [USER_WORKSPACE_ID]: ROLE_ID },
}: {
  canUpdateObjectRecords?: boolean;
  userWorkspaceRoleMap?: Record<string, string>;
} = {}): ORMWorkspaceContext =>
  ({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap: {},
    objectIdByNameSingular: { dashboard: DASHBOARD_OBJECT_METADATA_ID },
    flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: getFlatObjectMetadataMock({
        id: DASHBOARD_OBJECT_METADATA_ID,
        universalIdentifier: DASHBOARD_OBJECT_METADATA_ID,
        nameSingular: 'dashboard',
        namePlural: 'dashboards',
        isSystem: false,
      }),
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    permissionsPerRoleId: {
      [ROLE_ID]: {
        [DASHBOARD_OBJECT_METADATA_ID]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      },
    },
  }) as unknown as ORMWorkspaceContext;

describe('DashboardDuplicationService', () => {
  let service: DashboardDuplicationService;
  let workspaceContext: ORMWorkspaceContext;
  let dashboardRepository: { findOne: jest.Mock; insert: jest.Mock };
  let workspaceOrmManager: {
    getRepository: jest.Mock;
    executeInWorkspaceContext: jest.Mock;
  };
  let pageLayoutDuplicationService: { duplicate: jest.Mock };
  let pageLayoutService: { destroy: jest.Mock };

  beforeEach(async () => {
    workspaceContext = buildWorkspaceContext();
    dashboardRepository = {
      findOne: jest
        .fn()
        .mockImplementation(async ({ where }: { where: { id: string } }) =>
          where.id === DASHBOARD_ID
            ? originalDashboard
            : { ...originalDashboard, id: where.id, title: 'Sales (Copy)' },
        ),
      insert: jest
        .fn()
        .mockResolvedValue({ identifiers: [{ id: 'new-dashboard-id' }] }),
    };
    workspaceOrmManager = {
      getRepository: jest.fn().mockReturnValue(dashboardRepository),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((fn: () => unknown) =>
          withWorkspaceContext(workspaceContext, fn),
        ),
    };
    pageLayoutDuplicationService = {
      duplicate: jest.fn().mockResolvedValue({ id: 'new-page-layout-id' }),
    };
    pageLayoutService = { destroy: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardDuplicationService,
        {
          provide: PageLayoutDuplicationService,
          useValue: pageLayoutDuplicationService,
        },
        { provide: PageLayoutService, useValue: pageLayoutService },
        { provide: WorkspaceOrmManager, useValue: workspaceOrmManager },
        {
          provide: ActorFromAuthContextService,
          useValue: {
            injectActorFieldsOnCreate: jest
              .fn()
              .mockImplementation(
                async ({ records }: { records: object[] }) => records,
              ),
          },
        },
      ],
    }).compile();

    service = module.get(DashboardDuplicationService);
  });

  it('should read the source and create the copy under the caller role', async () => {
    const duplicatedDashboard = await service.duplicateDashboard(
      DASHBOARD_ID,
      authContext,
    );

    expect(workspaceOrmManager.getRepository).toHaveBeenCalledWith(
      'dashboard',
      { intersectionOf: [ROLE_ID] },
    );
    expect(pageLayoutDuplicationService.duplicate).toHaveBeenCalledWith({
      pageLayoutId: PAGE_LAYOUT_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(dashboardRepository.insert).toHaveBeenCalledWith({
      title: 'Sales (Copy)',
      pageLayoutId: 'new-page-layout-id',
      position: 1,
    });
    expect(duplicatedDashboard).toMatchObject({
      id: 'new-dashboard-id',
      title: 'Sales (Copy)',
    });
  });

  it('should only read the columns the duplication copies', async () => {
    await service.duplicateDashboard(DASHBOARD_ID, authContext);

    expect(dashboardRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: DASHBOARD_ID },
      select: ['id', 'title', 'pageLayoutId', 'position'],
    });
    expect(dashboardRepository.findOne).toHaveBeenNthCalledWith(2, {
      where: { id: 'new-dashboard-id' },
      select: [
        'id',
        'title',
        'pageLayoutId',
        'position',
        'createdAt',
        'updatedAt',
      ],
    });
  });

  it('should refuse the caller before copying the layout when the role cannot create dashboards', async () => {
    workspaceContext = buildWorkspaceContext({
      canUpdateObjectRecords: false,
    });

    await expect(
      service.duplicateDashboard(DASHBOARD_ID, authContext),
    ).rejects.toMatchObject({
      constructor: PermissionsException,
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
    expect(pageLayoutDuplicationService.duplicate).not.toHaveBeenCalled();
    expect(dashboardRepository.insert).not.toHaveBeenCalled();
  });

  it('should refuse a caller without a role before reading the source', async () => {
    workspaceContext = buildWorkspaceContext({ userWorkspaceRoleMap: {} });

    await expect(
      service.duplicateDashboard(DASHBOARD_ID, authContext),
    ).rejects.toMatchObject({
      constructor: PermissionsException,
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
    expect(dashboardRepository.findOne).not.toHaveBeenCalled();
    expect(pageLayoutDuplicationService.duplicate).not.toHaveBeenCalled();
  });

  it('should destroy the duplicated layout when the dashboard insert is refused', async () => {
    const permissionDenied = new PermissionsException(
      'Entity performing the request does not have permission',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    dashboardRepository.insert.mockRejectedValue(permissionDenied);

    await expect(
      service.duplicateDashboard(DASHBOARD_ID, authContext),
    ).rejects.toBe(permissionDenied);
    expect(pageLayoutService.destroy).toHaveBeenCalledWith({
      id: 'new-page-layout-id',
      workspaceId: WORKSPACE_ID,
    });
  });

  it('should surface the insert failure even when the layout cannot be destroyed', async () => {
    const insertError = new Error('insert failed');

    dashboardRepository.insert.mockRejectedValue(insertError);
    pageLayoutService.destroy.mockRejectedValue(new Error('destroy failed'));

    await expect(
      service.duplicateDashboard(DASHBOARD_ID, authContext),
    ).rejects.toBe(insertError);
  });

  it('should keep the duplicated layout when the dashboard is created', async () => {
    await service.duplicateDashboard(DASHBOARD_ID, authContext);

    expect(pageLayoutService.destroy).not.toHaveBeenCalled();
  });

  it('should report a missing dashboard when the source is out of the caller reach', async () => {
    dashboardRepository.findOne.mockResolvedValue(null);

    await expect(
      service.duplicateDashboard(DASHBOARD_ID, authContext),
    ).rejects.toMatchObject({
      constructor: DashboardException,
      code: DashboardExceptionCode.DASHBOARD_NOT_FOUND,
    });
    expect(pageLayoutDuplicationService.duplicate).not.toHaveBeenCalled();
  });
});
