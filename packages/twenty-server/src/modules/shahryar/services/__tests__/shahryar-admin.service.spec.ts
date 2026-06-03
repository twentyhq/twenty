import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('src/engine/core-modules/auth/services/auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock(
  'src/engine/core-modules/user-workspace/user-workspace.service',
  () => ({
    UserWorkspaceService: class UserWorkspaceService {},
  }),
);

jest.mock('src/engine/metadata-modules/user-role/user-role.service', () => ({
  UserRoleService: class UserRoleService {},
}));

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { SHAHRYAR_SUPERVISOR_ROLE_SEED } from 'src/engine/workspace-manager/dev-seeder/core/constants/shahryar-role-seeds.constant';
import { ShahryarAdminWorkspaceService } from 'src/modules/shahryar/services/shahryar-admin.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { DataSource } from 'typeorm';

describe('ShahryarAdminWorkspaceService', () => {
  const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

  let service: ShahryarAdminWorkspaceService;
  let authService: jest.Mocked<Pick<AuthService, 'updatePassword'>>;
  let coreDataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let roleService: jest.Mocked<Pick<RoleService, 'getWorkspaceRoles'>>;
  let userRoleService: jest.Mocked<
    Pick<
      UserRoleService,
      'assignRoleToManyUserWorkspace' | 'getRolesByUserWorkspaces'
    >
  >;
  let userWorkspaceService: jest.Mocked<
    Pick<
      UserWorkspaceService,
      'checkUserWorkspaceExists' | 'getWorkspaceMemberOrThrow'
    >
  >;

  beforeEach(async () => {
    authService = {
      updatePassword: jest.fn().mockResolvedValue({ success: true }),
    };
    coreDataSource = {
      query: jest.fn(),
    };
    roleService = {
      getWorkspaceRoles: jest.fn(),
    };
    userRoleService = {
      assignRoleToManyUserWorkspace: jest.fn().mockResolvedValue(undefined),
      getRolesByUserWorkspaces: jest.fn(),
    };
    userWorkspaceService = {
      checkUserWorkspaceExists: jest.fn(),
      getWorkspaceMemberOrThrow: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ShahryarAdminWorkspaceService,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: RoleService,
          useValue: roleService,
        },
        {
          provide: UserRoleService,
          useValue: userRoleService,
        },
        {
          provide: UserWorkspaceService,
          useValue: userWorkspaceService,
        },
        {
          provide: DataSource,
          useValue: coreDataSource,
        },
      ],
    }).compile();

    service = moduleRef.get(ShahryarAdminWorkspaceService);
  });

  const mockAdminAccess = () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValueOnce(
      new Map([
        [
          'admin-user-workspace-id',
          [
            {
              canUpdateAllSettings: true,
            } as RoleEntity,
          ],
        ],
      ]),
    );
  };

  it('should reset a workspace member password when the caller is a Shahryar admin', async () => {
    mockAdminAccess();
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);

    const response = await service.resetWorkspaceMemberPassword({
      workspaceId: WORKSPACE_ID,
      adminUserWorkspaceId: 'admin-user-workspace-id',
      workspaceMemberId: 'target-workspace-member-id',
      newPassword: 'new-password',
      resetAt: new Date('2026-06-01T10:00:00.000Z'),
    });

    expect(userRoleService.getRolesByUserWorkspaces).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: ['admin-user-workspace-id'],
    });
    expect(userWorkspaceService.getWorkspaceMemberOrThrow).toHaveBeenCalledWith(
      {
        workspaceId: WORKSPACE_ID,
        workspaceMemberId: 'target-workspace-member-id',
      },
    );
    expect(authService.updatePassword).toHaveBeenCalledWith(
      'target-user-id',
      'new-password',
    );
    expect(response).toEqual({
      success: true,
      workspaceMemberId: 'target-workspace-member-id',
      resetAt: '2026-06-01T10:00:00.000Z',
    });
  });

  it('should list workspace members when the caller is a Shahryar admin', async () => {
    mockAdminAccess();
    userRoleService.getRolesByUserWorkspaces.mockResolvedValueOnce(
      new Map([
        [
          'user-workspace-1',
          [
            {
              label: SHAHRYAR_SUPERVISOR_ROLE_SEED.label,
            } as RoleEntity,
          ],
        ],
      ]),
    );
    coreDataSource.query.mockResolvedValue([
      {
        id: 'workspace-member-1',
        nameFirstName: 'Karwan',
        nameLastName: 'Supervisor',
        username: 'karwan',
        userId: 'user-1',
        userEmail: 'karwan@example.test',
        userWorkspaceId: 'user-workspace-1',
      },
      {
        id: 'workspace-member-2',
        nameFirstName: null,
        nameLastName: null,
        username: 'halo',
        userId: 'user-2',
        userEmail: null,
        userWorkspaceId: 'user-workspace-2',
      },
    ]);

    await expect(
      service.listWorkspaceMembers({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'admin-user-workspace-id',
      }),
    ).resolves.toEqual([
      {
        id: 'workspace-member-1',
        name: 'Karwan Supervisor',
        username: 'karwan',
        userEmail: 'karwan@example.test',
        isShahryarSupervisor: true,
      },
      {
        id: 'workspace-member-2',
        name: 'halo',
        username: 'halo',
        userEmail: '',
        isShahryarSupervisor: false,
      },
    ]);
    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM "workspace_'),
      [WORKSPACE_ID],
    );
  });

  it('should create a supervisor by assigning the Shahryar supervisor role', async () => {
    mockAdminAccess();
    roleService.getWorkspaceRoles.mockResolvedValue([
      {
        id: 'supervisor-role-id',
        label: SHAHRYAR_SUPERVISOR_ROLE_SEED.label,
      } as RoleEntity,
    ]);
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);
    userWorkspaceService.checkUserWorkspaceExists.mockResolvedValue({
      id: 'target-user-workspace-id',
    } as UserWorkspaceEntity);
    coreDataSource.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(undefined);

    await expect(
      service.createSupervisor({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'admin-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
        username: 'karwan',
      }),
    ).resolves.toEqual({
      success: true,
      workspaceMemberId: 'target-workspace-member-id',
      username: 'karwan',
      isShahryarSupervisor: true,
    });
    expect(userRoleService.assignRoleToManyUserWorkspace).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: ['target-user-workspace-id'],
      roleId: 'supervisor-role-id',
    });
  });

  it('should reject duplicate username updates', async () => {
    mockAdminAccess();
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);
    userWorkspaceService.checkUserWorkspaceExists.mockResolvedValue({
      id: 'target-user-workspace-id',
    } as UserWorkspaceEntity);
    coreDataSource.query.mockResolvedValueOnce([
      {
        id: 'other-workspace-member-id',
      },
    ]);

    await expect(
      service.updateSupervisorUsername({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'admin-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
        username: 'karwan',
      }),
    ).rejects.toThrow('This Shahryar username is already used.');
    expect(
      userRoleService.assignRoleToManyUserWorkspace,
    ).not.toHaveBeenCalled();
  });

  it('should remove supervisor operations access by assigning the workspace default role', async () => {
    mockAdminAccess();
    roleService.getWorkspaceRoles.mockResolvedValue([
      {
        id: 'supervisor-role-id',
        label: SHAHRYAR_SUPERVISOR_ROLE_SEED.label,
      } as RoleEntity,
    ]);
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);
    userWorkspaceService.checkUserWorkspaceExists.mockResolvedValue({
      id: 'target-user-workspace-id',
    } as UserWorkspaceEntity);
    userRoleService.getRolesByUserWorkspaces.mockResolvedValueOnce(
      new Map([
        [
          'target-user-workspace-id',
          [
            {
              id: 'supervisor-role-id',
              label: SHAHRYAR_SUPERVISOR_ROLE_SEED.label,
            } as RoleEntity,
          ],
        ],
      ]),
    );
    coreDataSource.query
      .mockResolvedValueOnce([{ defaultRoleId: 'default-role-id' }])
      .mockResolvedValueOnce([{ username: 'karwan' }]);

    await expect(
      service.removeSupervisor({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'admin-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
      }),
    ).resolves.toEqual({
      success: true,
      workspaceMemberId: 'target-workspace-member-id',
      username: 'karwan',
      isShahryarSupervisor: false,
    });
    expect(userRoleService.assignRoleToManyUserWorkspace).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      userWorkspaceIds: ['target-user-workspace-id'],
      roleId: 'default-role-id',
    });
  });

  it('should reject supervisor creation when the Shahryar supervisor role is missing', async () => {
    mockAdminAccess();
    roleService.getWorkspaceRoles.mockResolvedValue([]);
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);
    userWorkspaceService.checkUserWorkspaceExists.mockResolvedValue({
      id: 'target-user-workspace-id',
    } as UserWorkspaceEntity);
    coreDataSource.query.mockResolvedValueOnce([{ username: 'karwan' }]);

    await expect(
      service.createSupervisor({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'admin-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
      }),
    ).rejects.toThrow('Shahryar supervisor role was not found.');
    expect(
      userRoleService.assignRoleToManyUserWorkspace,
    ).not.toHaveBeenCalled();
  });

  it('should reject username edits from non-admin users', async () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'supervisor-user-workspace-id',
          [
            {
              canUpdateAllSettings: false,
            } as RoleEntity,
          ],
        ],
      ]),
    );

    await expect(
      service.updateSupervisorUsername({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'supervisor-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
        username: 'karwan',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(coreDataSource.query).not.toHaveBeenCalled();
  });

  it('should reject password resets from non-admin users', async () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'supervisor-user-workspace-id',
          [
            {
              canUpdateAllSettings: false,
            } as RoleEntity,
          ],
        ],
      ]),
    );

    await expect(
      service.resetWorkspaceMemberPassword({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: 'supervisor-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(
      userWorkspaceService.getWorkspaceMemberOrThrow,
    ).not.toHaveBeenCalled();
    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('should reject password resets without a workspace user context', async () => {
    await expect(
      service.resetWorkspaceMemberPassword({
        workspaceId: WORKSPACE_ID,
        adminUserWorkspaceId: undefined,
        workspaceMemberId: 'target-workspace-member-id',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(userRoleService.getRolesByUserWorkspaces).not.toHaveBeenCalled();
  });
});
